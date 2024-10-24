import { ENV_NAMES } from '@lib/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import { UsersModule } from './crud';
import { DatabaseModule } from './crud/database/database.module';
import { ReferralsModule } from './crud/referrals';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ENV_NAMES.ENV_PATH(process.env.NODE_ENV),
      isGlobal: true,
    }),
    BotModule,
    DatabaseModule,
    UsersModule,
    ReferralsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
