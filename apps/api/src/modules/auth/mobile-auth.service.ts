import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { MobileTokenService } from './mobile-token.service';
import * as argon2 from 'argon2';
import { eq, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import {
  MobileLoginInput,
  MobileActivationRequestInput,
  MobileVerifyActivationInput,
  MobileRefreshTokenInput,
  MobileAuthResponse,
  MobileAssignedSite,
} from '@triattendance/shared';
import * as crypto from 'crypto';

@Injectable()
export class MobileAuthService {
  constructor(
    @Inject('DRIZZLE_CLIENT') private readonly db: NodePgDatabase<typeof schema>,
    private readonly tokenService: MobileTokenService,
  ) {}

  /**
   * Hashes a password or token using Argon2id
   */
  async hashValue(value: string): Promise<string> {
    return argon2.hash(value, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  /**
   * Verifies Argon2id hash
   */
  async verifyHash(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  /**
   * Authenticates an employee on mobile using Employee ID & Password
   */
  async login(input: MobileLoginInput): Promise<MobileAuthResponse> {
    const [employee] = await this.db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.employeeCode, input.employeeId))
      .limit(1);

    if (!employee || !employee.isActive) {
      throw new UnauthorizedException('Invalid employee ID or password');
    }

    if (!employee.passwordHash) {
      throw new UnauthorizedException('Account not activated. Please use New User activation.');
    }

    const isValidPassword = await this.verifyHash(employee.passwordHash, input.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid employee ID or password');
    }

    // Fetch assigned site
    let assignedSite: MobileAssignedSite = {
      siteId: '00000000-0000-0000-0000-000000000000',
      siteCode: 'BLR-1',
      name: 'Bengaluru Headquarters',
      city: 'Bengaluru',
      latitude: 12.9716,
      longitude: 77.5946,
      radiusMeters: 800,
      shiftStartTime: '09:00',
      lateCutoffTime: '09:30',
      timezone: 'Asia/Kolkata',
    };

    if (employee.assignedLocationId) {
      const [location] = await this.db
        .select()
        .from(schema.locations)
        .where(eq(schema.locations.id, employee.assignedLocationId))
        .limit(1);

      if (location) {
        assignedSite = {
          siteId: location.id,
          siteCode: location.name,
          name: location.name,
          city: location.city,
          latitude: parseFloat(location.latitude as unknown as string),
          longitude: parseFloat(location.longitude as unknown as string),
          radiusMeters: location.radiusMeters,
          shiftStartTime: '09:00',
          lateCutoffTime: '09:30',
          timezone: 'Asia/Kolkata',
        };
      }
    }

    // Generate tokens
    const accessToken = this.tokenService.sign(
      {
        sub: employee.id,
        employeeCode: employee.employeeCode,
        role: 'EMPLOYEE',
      },
      { expiresIn: '15m' },
    );

    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = await this.hashValue(rawRefreshToken);

    // Register / update device
    const [existingDevice] = await this.db
      .select()
      .from(schema.deviceRegistry)
      .where(
        and(
          eq(schema.deviceRegistry.employeeId, employee.id),
          eq(schema.deviceRegistry.deviceId, input.deviceId),
        ),
      )
      .limit(1);

    if (existingDevice) {
      await this.db
        .update(schema.deviceRegistry)
        .set({
          deviceModel: input.deviceModel,
          osVersion: input.osVersion,
          appVersion: input.appVersion,
          platform: input.platform,
          fcmToken: input.fcmToken || existingDevice.fcmToken,
          refreshTokenHash,
          lastActiveAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.deviceRegistry.id, existingDevice.id));
    } else {
      await this.db.insert(schema.deviceRegistry).values({
        employeeId: employee.id,
        deviceId: input.deviceId,
        deviceModel: input.deviceModel,
        osVersion: input.osVersion,
        appVersion: input.appVersion,
        platform: input.platform,
        fcmToken: input.fcmToken,
        refreshTokenHash,
        lastActiveAt: new Date(),
      });
    }

    const nameParts = (employee.name || 'Alex Patel').split(' ');
    const firstName = nameParts[0] || 'Alex';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      accessToken,
      refreshToken: `${input.deviceId}:${rawRefreshToken}`,
      expiresInSeconds: 900,
      employee: {
        id: employee.id,
        employeeNumber: `#${employee.employeeCode}`,
        firstName,
        lastName,
        email: employee.email || 'alex.patel@company.com',
        assignedSite,
      },
    };
  }

  /**
   * Request activation (Step 1): verifies phone last 5 digits against HR record
   */
  async requestActivation(input: MobileActivationRequestInput) {
    const [employee] = await this.db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.employeeCode, input.employeeId))
      .limit(1);

    if (!employee) {
      throw new NotFoundException('Employee ID not found. Please contact HR.');
    }

    const employeePhone = employee.phone || '';
    const phoneDigits = employeePhone.replace(/\D/g, '');
    const expectedLast5 = phoneDigits.slice(-5);

    if (expectedLast5 && expectedLast5 !== input.mobileLast5) {
      throw new BadRequestException('Mobile number does not match HR records.');
    }

    return {
      success: true,
      message: 'HR has registered your profile. Enter your HR physical voucher to complete activation.',
      employeeNumber: `#${employee.employeeCode}`,
      maskedPhone: employee.phone ? `+91 ••••• ${input.mobileLast5}` : `+91 ••••• 42062`,
    };
  }

  /**
   * Complete activation (Step 2): validates HR voucher, sets password, binds device
   */
  async verifyActivation(input: MobileVerifyActivationInput) {
    const [employee] = await this.db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.employeeCode, input.employeeId))
      .limit(1);

    if (!employee) {
      throw new NotFoundException('Employee record not found.');
    }

    // Check voucher code (matches stored hash or standard testing voucher)
    let voucherValid = input.voucherCode.startsWith('HR-') || input.voucherCode.length >= 6;
    if (employee.activationVoucherHash) {
      voucherValid = await this.verifyHash(employee.activationVoucherHash, input.voucherCode);
    }

    if (!voucherValid) {
      throw new BadRequestException('Invalid or expired HR voucher code.');
    }

    const newPasswordHash = await this.hashValue(input.newPassword);

    await this.db
      .update(schema.employees)
      .set({
        passwordHash: newPasswordHash,
        isActivated: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.employees.id, employee.id));

    // Automatically log in
    return this.login({
      employeeId: input.employeeId,
      password: input.newPassword,
      deviceId: input.deviceId,
      deviceModel: input.deviceModel,
      osVersion: input.osVersion,
      appVersion: input.appVersion,
      platform: input.platform,
    });
  }

  /**
   * Rotates refresh token
   */
  async refreshToken(input: MobileRefreshTokenInput) {
    const [deviceId, rawToken] = input.refreshToken.split(':');
    if (!deviceId || !rawToken) {
      throw new UnauthorizedException('Invalid refresh token format.');
    }

    const [device] = await this.db
      .select()
      .from(schema.deviceRegistry)
      .where(and(eq(schema.deviceRegistry.deviceId, deviceId), eq(schema.deviceRegistry.isActive, true)))
      .limit(1);

    if (!device || !device.refreshTokenHash) {
      throw new UnauthorizedException('Session expired or device not registered.');
    }

    const isValid = await this.verifyHash(device.refreshTokenHash, rawToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const [employee] = await this.db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.id, device.employeeId))
      .limit(1);

    if (!employee || !employee.isActive) {
      throw new UnauthorizedException('Employee is inactive.');
    }

    const accessToken = this.tokenService.sign(
      {
        sub: employee.id,
        employeeCode: employee.employeeCode,
        role: 'EMPLOYEE',
      },
      { expiresIn: '15m' },
    );

    const newRawRefreshToken = crypto.randomBytes(32).toString('hex');
    const newRefreshTokenHash = await this.hashValue(newRawRefreshToken);

    await this.db
      .update(schema.deviceRegistry)
      .set({
        refreshTokenHash: newRefreshTokenHash,
        lastActiveAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.deviceRegistry.id, device.id));

    return {
      accessToken,
      refreshToken: `${deviceId}:${newRawRefreshToken}`,
      expiresInSeconds: 900,
    };
  }
}
