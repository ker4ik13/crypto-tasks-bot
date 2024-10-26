import { BotService } from '@/bot/bot.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { SceneContext, WizardContext } from 'telegraf/scenes';

@Injectable()
export class CheckSubscriptionGuard implements CanActivate {
  constructor(private readonly botService: BotService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Получаем аргументы контекста и извлекаем первый параметр как ctx
    const [ctx]: [Context | SceneContext | WizardContext] = context.getArgs();

    if (!ctx?.from?.id) {
      console.log('Context or user ID not found');
      return false;
    }

    // Проверка подписок через BotService
    const notSubsChannels = await this.botService.checkChannelsSubs(ctx);

    if (notSubsChannels.length > 0) {
      return false;
    }

    return true;
  }
}
