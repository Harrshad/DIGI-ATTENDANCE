import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { WorkforceService } from './workforce.service';
import { AuthGuard } from '../auth/auth.guard';
import { ScopingInterceptor } from '../../common/scoping.interceptor';
import { CurrentUser } from '../../common/current-user.decorator';
import {
  EmployeeDirectoryItem,
  EmployeePerformanceKPISummary,
  AttendanceHistoryRecord,
  PaginatedResponse,
  UserProfile,
  ApiResponse as IApiResponse,
} from '@triattendance/shared';

@ApiTags('Workforce')
@ApiCookieAuth('session_id')
@Controller('workforce')
@UseGuards(AuthGuard)
@UseInterceptors(ScopingInterceptor)
export class WorkforceController {
  constructor(private readonly workforceService: WorkforceService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated employee directory with 5 filters (employee-directory.png)' })
  @ApiResponse({ status: 200, description: 'Workforce directory retrieved' })
  async getWorkforceDirectory(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('exceptionFilter') exceptionFilter: string,
    @Query('checkInStatus') checkInStatus: string,
    @Query('locationMismatch') locationMismatch: string,
    @Query('status') status: string,
    @Query('assignedSiteId') assignedSiteId: string,
    @CurrentUser() user: UserProfile
  ): Promise<IApiResponse<PaginatedResponse<EmployeeDirectoryItem>>> {
    const scopedIds = user.role === 'ADMIN' ? undefined : user.assignedLocationIds;
    const data = await this.workforceService.getWorkforceDirectory({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      exceptionFilter,
      checkInStatus,
      locationMismatch,
      status,
      assignedSiteId,
      scopedLocationIds: scopedIds,
    });
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single employee profile with 30-day KPIs and read-only history (AM 05)' })
  @ApiResponse({ status: 200, description: 'Employee detail retrieved' })
  async getEmployeeDetail(
    @Param('id') id: string
  ): Promise<
    IApiResponse<{
      employee: EmployeeDirectoryItem;
      kpis: EmployeePerformanceKPISummary;
      history: AttendanceHistoryRecord[];
    }>
  > {
    const data = await this.workforceService.getEmployeeDetail(id);
    return { success: true, data };
  }
}
