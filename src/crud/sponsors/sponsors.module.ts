import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users';
import { SponsorsController } from './sponsors.controller';
import { SponsorsService } from './sponsors.service';

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [SponsorsController],
  providers: [SponsorsService],
  exports: [SponsorsService],
})
export class SponsorsModule {}
