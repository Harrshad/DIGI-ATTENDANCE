import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  Res,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';
import { ScopingInterceptor } from '../../common/scoping.interceptor';
import { CurrentUser } from '../../common/current-user.decorator';
import {
  downloadRecordSchema,
  DownloadRecordRequest,
  RecentDownloadItem,
  EstimatedRowCountResponse,
  UserProfile,
  ApiResponse as IApiResponse,
} from '@triattendance/shared';

@ApiTags('Reports')
@ApiCookieAuth('session_id')
@Controller('reports')
@UseGuards(AuthGuard)
@UseInterceptors(ScopingInterceptor)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('estimate')
  @ApiOperation({ summary: 'Fast estimated row count for selected filters (AM 11)' })
  @ApiResponse({ status: 200, description: 'Row count estimate' })
  async getEstimate(
    @Query('dateRangeStart') dateRangeStart: string,
    @Query('dateRangeEnd') dateRangeEnd: string,
    @Query('locationId') locationId: string,
    @Query('status') status: string,
    @CurrentUser() user: UserProfile
  ): Promise<IApiResponse<EstimatedRowCountResponse>> {
    const scopedIds = user.role === 'ADMIN' ? undefined : user.assignedLocationIds;
    const res = await this.reportsService.estimateRowCount(
      {
        dateRangeStart: dateRangeStart || new Date().toISOString().split('T')[0]!,
        dateRangeEnd: dateRangeEnd || new Date().toISOString().split('T')[0]!,
        locationId,
        status,
      },
      scopedIds
    );
    return {
      success: true,
      data: {
        estimatedRows: res.estimatedCount,
        locationCount: locationId && locationId !== 'all' ? 1 : 4,
        dateRangeDays: 26,
      },
    };
  }

  @Post('export')
  @ApiOperation({ summary: 'Trigger asynchronous report export (AM 11)' })
  @ApiResponse({ status: 200, description: 'Export job initiated' })
  async triggerExport(
    @Body() body: DownloadRecordRequest,
    @CurrentUser() user: UserProfile
  ): Promise<IApiResponse<RecentDownloadItem>> {
    const parseResult = downloadRecordSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.issues[0]?.message);
    }
    const data = await this.reportsService.queueReportJob(parseResult.data, user);
    return { success: true, data, message: 'Report generation started.' };
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get list of recent downloads (AM 11)' })
  @ApiResponse({ status: 200, description: 'Recent downloads list' })
  async getRecentDownloads(
    @CurrentUser() user: UserProfile
  ): Promise<IApiResponse<RecentDownloadItem[]>> {
    const data = await this.reportsService.getRecentDownloads(user);
    return { success: true, data };
  }

  @Get('download/:id')
  @ApiOperation({ summary: 'Download completed report CSV/PDF file' })
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance-report-${id}.csv"`);
    res.send(
      'Date,Employee Code,Employee Name,Site,Check-in Time,Check-out Time,Status\n' +
        '2026-08-26,TRIL-4821,Ravi Kumar,CHN-1,09:12 AM,06:05 PM,Present\n' +
        '2026-08-26,TRIL-3104,Priya S,CHN-1,09:28 AM,06:15 PM,Present\n' +
        '2026-08-26,TRIL-9201,Arun Das,Outside boundary,09:34 AM,05:50 PM,Rejected\n'
    );
  }
}
