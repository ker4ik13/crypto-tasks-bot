import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MessagesModule } from '../messages';
import { UsersModule } from '../users';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';

@Module({
  imports: [DatabaseModule, UsersModule, MessagesModule],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
