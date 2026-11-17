import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface JwtPayload {
  sub: string;
  employeeCode?: string;
  role?: string;
  [key: string]: unknown;
}

@Injectable()
export class MobileTokenService {
  private readonly secret = process.env.JWT_SECRET || 'triattendance-secret-key-development';

  sign(payload: JwtPayload, options: { expiresIn: string }): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');

    const expSeconds = options.expiresIn.endsWith('m')
      ? parseInt(options.expiresIn) * 60
      : 900;
    const now = Math.floor(Date.now() / 1000);

    const fullPayload = {
      ...payload,
      iat: now,
      exp: now + expSeconds,
    };
    const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verify<T = JwtPayload>(token: string): T {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token structure');
    }
    const [header, payload, signature] = parts;
    if (!header || !payload || !signature) {
      throw new Error('Invalid token structure');
    }
    const expectedSig = crypto
      .createHmac('sha256', this.secret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSig) {
      throw new Error('Invalid token signature');
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }
    return decoded as T;
  }
}
