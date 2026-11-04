import { Module } from '@nestjs/common';
import { ExceptionsService } from './exceptions.service';
import { ExceptionsController } from './exceptions.controller';
import { AuthModule } from '../auth/auth.module';
import { LocalGarageStorageService } from '../../storage/local-garage-storage.service';

@Module({
  imports: [AuthModule],
  controllers: [ExceptionsController],
  providers: [ExceptionsService, LocalGarageStorageService],
  exports: [ExceptionsService],
})
export class ExceptionsModule {}
