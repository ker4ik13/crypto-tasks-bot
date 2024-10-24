import { ENV_NAMES } from '@lib/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ENV_NAMES.ENV_PATH(process.env.NODE_ENV),
      isGlobal: true,
    }),
    BotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
