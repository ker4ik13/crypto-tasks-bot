import { BotService } from '@/bot/bot.service';
import { UsersService } from '@/crud';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { SceneContext, WizardContext } from 'telegraf/scenes';

@Injectable()
export class CheckSubscriptionGuard implements CanActivate {
  constructor(
    private readonly botService: BotService,

    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Получаем аргументы контекста и извлекаем первый параметр как ctx
    const [ctx]: [Context | SceneContext | WizardContext] = context.getArgs();

    if (!ctx?.from?.id) {
      return false;
    }

    const user = await this.usersService.findByTelegramId(
      ctx.from.id.toString(),
    );

    if (user && user.isAdmin) {
      return true;
    }

    // Проверка подписок через BotService
    const notSubsChannels = await this.botService.checkChannelsSubs(
      ctx,
      'first',
      user,
    );

    if (notSubsChannels.length > 0) {
      return false;
    }

    return true;
  }
}
