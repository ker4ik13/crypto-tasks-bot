import { ENV_NAMES } from '@lib/common/constants';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
// import { BotController } from './bot.controller';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get(ENV_NAMES.TELEGRAM_BOT_TOKEN),
        middlewares: [session()],
      }),
    }),
  ],
  providers: [BotService, BotUpdate],
  exports: [BotService],
  // controllers: [BotController],
})
export class BotModule {}
