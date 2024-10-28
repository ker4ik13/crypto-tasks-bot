import { BotService } from '@/bot/bot.service';
import { UsersFindService } from '@/crud';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { SceneContext, WizardContext } from 'telegraf/scenes';

@Injectable()
export class CheckSubscriptionGuard implements CanActivate {
  constructor(
    private readonly botService: BotService,
    private readonly usersFindService: UsersFindService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Получаем аргументы контекста и извлекаем первый параметр как ctx
    const [ctx]: [Context | SceneContext | WizardContext] = context.getArgs();

    if (!ctx?.from?.id) {
      return false;
    }

    const user = await this.usersFindService.findByTelegramId(
      ctx.from.id.toString(),
    );

    if (user && user.isAdmin) {
      return true;
    }

    const notSubsChannels = await this.botService.checkChannelsSubs(
      ctx,
      'next',
      user,
    );

    if (notSubsChannels.length > 0) {
      return false;
    }

    return true;
  }
}
