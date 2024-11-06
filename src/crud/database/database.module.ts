import { SystemLoggerModule } from '@/config';
import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
  imports: [SystemLoggerModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
