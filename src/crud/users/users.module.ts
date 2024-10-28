import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MessagesModule } from '../messages';
import { ReferralsModule } from '../referrals';
import { UsersFindService } from './users-find.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => ReferralsModule),
    forwardRef(() => MessagesModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersFindService],
  exports: [UsersService, UsersFindService],
})
export class UsersModule {}
