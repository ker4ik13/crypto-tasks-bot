import { ENV_NAMES } from '@lib/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BotModule } from './bot/bot.module';
import { MessagesModule, UsersModule } from './crud';
import { DatabaseModule } from './crud/database/database.module';
import { ReferralsModule } from './crud/referrals';
import { SponsorsModule } from './crud/sponsors';
import { WalletModule } from './crud/wallet';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ENV_NAMES.ENV_PATH(process.env.NODE_ENV),
      isGlobal: true,
    }),
    DatabaseModule,
    ScheduleModule.forRoot(),
    BotModule,
    MessagesModule,
    ReferralsModule,
    UsersModule,
    SponsorsModule,
    WalletModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
