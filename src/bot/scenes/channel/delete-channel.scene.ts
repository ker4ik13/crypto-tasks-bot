import { adminChannelKeyboard, adminMenuKeyboard } from '@/bot/keyboards/admin';
import { deleteChannelKeyboard } from '@/bot/keyboards/admin/channel';
import { BotAdminMessages } from '@/bot/messages';
import { SponsorsService, UsersFindService } from '@/crud';
import { ENV_NAMES } from '@/lib/common';
import { getNormalChannelLink } from '@/lib/helpers';
import { emojis } from '@/lib/utils';
import { ConfigService } from '@nestjs/config';
import type { SponsorChannel, User } from '@prisma/client';
import { Action, Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { WizardContext } from 'telegraf/scenes';

@Wizard('delete-channel')
export class DeleteChannelScene {
  channel: SponsorChannel & { subsUsers: User[] };

  constructor(
    private readonly sponsorsService: SponsorsService,
    private readonly configService: ConfigService,
    private readonly usersFindService: UsersFindService,
  ) {}

  @WizardStep(1)
  async enter(@Ctx() ctx: WizardContext): Promise<void> {
    const { channel } = ctx.scene.state as {
      channel: SponsorChannel & { subsUsers: User[] };
    };
    this.channel = channel;
    await ctx.reply(
      `${emojis.passport} <b>Вы действительно хотите удалить канал ${getNormalChannelLink(this.channel)} ?</b>`,
      {
        parse_mode: 'HTML',
        link_preview_options: {
          is_disabled: true,
        },
        reply_markup: {
          inline_keyboard: deleteChannelKeyboard(),
        },
      },
    );
    ctx.wizard.next();
    return;
  }

  @Action('delete-channel|yes')
  @WizardStep(2)
  async deleteChannel(@Ctx() ctx: WizardContext): Promise<void> {
    await this.sponsorsService.removeById(this.channel.id);

    await ctx.reply(`${emojis.checkmark} Канал успешно удален`);
    await ctx.scene.leave();

    const user = await this.usersFindService.findByTelegramId(
      ctx.from.id.toString(),
    );

    await ctx.reply(BotAdminMessages.menu(user), {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: adminMenuKeyboard(),
      },
    });
    return;
  }

  @Action('cancel')
  async exit(@Ctx() ctx: WizardContext) {
    await ctx
      .answerCbQuery()
      .catch(() =>
        ctx.reply(`${emojis.warning} Произошла ошибка, попробуйте раз`),
      );
    await ctx.reply(`${emojis.cross} Отменено`);

    const currency = this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY);
    await ctx.reply(BotAdminMessages.channel(this.channel, currency), {
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
      reply_markup: {
        inline_keyboard: adminChannelKeyboard(this.channel),
      },
    });
    return await ctx.scene.leave();
  }
}
