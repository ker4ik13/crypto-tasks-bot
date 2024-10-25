import { ENV_NAMES } from '@lib/common/constants';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { DatabaseModule } from '../database';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ENV_NAMES.ENV_PATH(process.env.NODE_ENV),
      isGlobal: true,
    }),
    DatabaseModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get(ENV_NAMES.TELEGRAM_BOT_TOKEN),
        middlewares: [session()],
      }),
    }),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
