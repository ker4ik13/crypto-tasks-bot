import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReferralsModule } from '../referrals';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, ReferralsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
