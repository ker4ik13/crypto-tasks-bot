import { ReferralsModule, SponsorsModule, UsersModule } from '@/crud';
import { MiningModule } from '@/crud/mining';
import { ENV_NAMES } from '@lib/common/constants';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { BotService } from './bot.service';
import { AdminUpdate, BotUpdate, MiningUpdate } from './updates';
import { EditChannelUpdate } from './updates/admin';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ENV_NAMES.ENV_PATH(process.env.NODE_ENV),
      isGlobal: true,
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get(ENV_NAMES.TELEGRAM_BOT_TOKEN),
        middlewares: [session()],
      }),
    }),
    UsersModule,
    ReferralsModule,
    SponsorsModule,
    MiningModule,
  ],
  providers: [
    BotService,
    BotUpdate,
    MiningUpdate,
    AdminUpdate,
    EditChannelUpdate,
  ],
  exports: [BotService],
})
export class BotModule {}
