import { SystemLoggerModule } from '@/config';
import { ReferralsModule, SponsorsModule, UsersModule } from '@/crud';
import { MiningModule } from '@/crud/mining';
import { ENV_NAMES } from '@lib/common/constants';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { BotService } from './bot.service';
import { SceneModule } from './scenes';
import { AdminUpdate, BotUpdate, MiningUpdate } from './updates';
import { AdminMailingUpdate, EditChannelUpdate } from './updates/admin';

@Module({
  imports: [
    SystemLoggerModule,
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
    SceneModule,
  ],
  providers: [
    BotService,
    BotUpdate,
    MiningUpdate,
    AdminUpdate,
    EditChannelUpdate,
    AdminMailingUpdate,
  ],
  exports: [BotService],
})
export class BotModule {}
