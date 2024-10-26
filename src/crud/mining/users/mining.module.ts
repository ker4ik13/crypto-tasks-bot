import { DatabaseModule } from '@/crud/database';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class UsersModule {}
