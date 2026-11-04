import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { ExceptionsService } from './exceptions.service';
import { AuthGuard } from '../auth/auth.guard';
import { ScopingInterceptor } from '../../common/scoping.interceptor';
import { CurrentUser } from '../../common/current-user.decorator';
import {
  escalateExceptionSchema,
  resolveExceptionSchema,
  EscalateExceptionRequest,
  ResolveExceptionRequest,
  ExceptionQueueItem,
  ExceptionReviewDetail,
  UserProfile,
  ApiResponse as IApiResponse,
} from '@triattendance/shared';

@ApiTags('Exceptions')
@ApiCookieAuth('session_id')
@Controller('exceptions')
@UseGuards(AuthGuard)
@UseInterceptors(ScopingInterceptor)
export class ExceptionsController {
  constructor(private readonly exceptionsService: ExceptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get alerts / exceptions queue with tab filtering (AM 06)' })
  @ApiResponse({ status: 200, description: 'Exceptions queue retrieved' })
  async getExceptionsQueue(
    @Query('tab') tab: 'ALL_OPEN' | 'GEOFENCE' | 'LIVENESS' | 'MISSING_CHECKOUT',
    @CurrentUser() user: UserProfile
  ): Promise<IApiResponse<ExceptionQueueItem[]>> {
    const scopedIds = user.role === 'ADMIN' ? undefined : user.assignedLocationIds;
    const data = await this.exceptionsService.getExceptionsQueue(tab, scopedIds);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single exception review details with evidence and map data (AM 07)' })
  @ApiResponse({ status: 200, description: 'Exception details retrieved' })
  async getExceptionDetail(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile
  ): Promise<IApiResponse<ExceptionReviewDetail>> {
    const data = await this.exceptionsService.getExceptionDetail(id, user);
    return { success: true, data };
  }

  @Post(':id/escalate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Escalate exception to supervisor with manager note (AM 07)' })
  @ApiResponse({ status: 200, description: 'Escalation recorded' })
  async escalateException(
    @Param('id') id: string,
    @Body() body: EscalateExceptionRequest,
    @CurrentUser() user: UserProfile
  ): Promise<IApiResponse<null>> {
    const parseResult = escalateExceptionSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.issues[0]?.message);
    }
    await this.exceptionsService.escalateException(id, parseResult.data, user);
    return { success: true, data: null, message: 'Exception escalated to supervisor.' };
  }

  @Post(':id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve exception directly (delegated permission / supervisor)' })
  @ApiResponse({ status: 200, description: 'Resolution recorded' })
  async resolveException(
    @Param('id') id: string,
    @Body() body: ResolveExceptionRequest,
    @CurrentUser() user: UserProfile
  ): Promise<IApiResponse<null>> {
    const parseResult = resolveExceptionSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException(parseResult.error.issues[0]?.message);
    }
    await this.exceptionsService.resolveException(id, parseResult.data, user);
    return { success: true, data: null, message: 'Exception resolution applied.' };
  }
}
