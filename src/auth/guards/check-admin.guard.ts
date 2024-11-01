import { UsersService } from '@/crud';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { SceneContext, WizardContext } from 'telegraf/scenes';

@Injectable()
export class CheckAdminGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const [ctx]: [Context | SceneContext | WizardContext] = context.getArgs();

    if (!ctx?.from?.id) {
      return false;
    }

    const isAdmin = await this.usersService.isUserAdmin(ctx.from.id);

    if (!isAdmin) {
      await ctx.reply('Недостаточно прав для выполнения данного действия');
      return isAdmin;
    }

    return isAdmin;
  }
}
