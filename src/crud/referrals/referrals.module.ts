import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
// import { UsersController } from './users.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
