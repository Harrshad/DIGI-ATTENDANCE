import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { AuthGuard } from '../auth/auth.guard';
import { ScopingInterceptor } from '../../common/scoping.interceptor';
import { CurrentUser } from '../../common/current-user.decorator';
import {
  createLocationSchema,
  CreateLocationRequest,
  WorkLocation,
  UserProfile,
  ApiResponse as IApiResponse,
} from '@triattendance/shared';

@ApiTags('Locations')
@ApiCookieAuth('session_id')
@Controller('locations')
@UseGuards(AuthGuard)
@UseInterceptors(ScopingInterceptor)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get work locations scoped to manager assignments' })
  @ApiResponse({ status: 200, description: 'List of accessible locations' })
  async getLocations(
    @CurrentUser() user: UserProfile,
  ): Promise<IApiResponse<WorkLocation[]>> {
    const scopedIds = user.role === 'ADMIN' ? undefined : user.assignedLocationIds;
    const data = await this.locationsService.getLocations(scopedIds);
    return { success: true, data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new work location (Admin only)' })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  async createLocation(
    @Body() body: CreateLocationRequest,
  ): Promise<IApiResponse<WorkLocation>> {
    const parseResult = createLocationSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.issues[0]?.message);
    }
    const data = await this.locationsService.createLocation(parseResult.data);
    return { success: true, data, message: 'Work location saved successfully.' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a work location' })
  async deleteLocation(@Param('id') id: string): Promise<IApiResponse<null>> {
    await this.locationsService.deleteLocation(id);
    return { success: true, data: null, message: 'Location deleted successfully.' };
  }
}
