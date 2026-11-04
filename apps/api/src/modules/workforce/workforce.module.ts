import { Module } from '@nestjs/common';
import { WorkforceService } from './workforce.service';
import { WorkforceController } from './workforce.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WorkforceController],
  providers: [WorkforceService],
  exports: [WorkforceService],
})
export class WorkforceModule {}
