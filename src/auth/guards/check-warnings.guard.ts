import { UsersService } from '@/crud';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { SceneContext, WizardContext } from 'telegraf/scenes';

@Injectable()
export class CheckWarningsGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Получаем аргументы контекста и извлекаем первый параметр как ctx
    const [ctx]: [Context | SceneContext | WizardContext] = context.getArgs();

    if (!ctx?.from?.id) {
      return false;
    }

    const user = await this.usersService.checkWarnings(ctx.from.id.toString());

    if (user.isError) {
      ctx.reply(user.message, {
        parse_mode: 'HTML',
      });
      return false;
    }

    return true;
  }
}
