import { CheckAdmin } from '@/auth/decorators';
import { adminChannelKeyboard } from '@/bot/keyboards/admin';
import { BotAdminMessages } from '@/bot/messages';
import { SponsorsService } from '@/crud';
import { UsersAdminService } from '@/crud/users/users-admin.service';
import { UsersFindService } from '@/crud/users/users-find.service';
import { ENV_NAMES } from '@/lib/common';
import { getValueFromAction } from '@/lib/helpers';
import { ConfigService } from '@nestjs/config';
import { SponsorChannelType } from '@prisma/client';
import { Action, Ctx, Update } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/scenes';

@Update()
export class EditChannelUpdate {
  constructor(
    private readonly usersFindService: UsersFindService,
    private readonly usersAdminService: UsersAdminService,
    private readonly configService: ConfigService,
    private readonly sponsorsService: SponsorsService,
  ) {}

  @Action(/toggle-channel-type\|(\d+)\|([a-zA-Z]+)/)
  @CheckAdmin()
  async toggleChannelType(@Ctx() ctx: SceneContext) {
    const channelId = getValueFromAction(ctx, 1);
    const channel = await this.sponsorsService.findById(+channelId);

    const channelType = getValueFromAction(ctx, 2) as SponsorChannelType;

    if (!channel) {
      return;
    }

    const currency = this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY);

    const updatedChannel = await this.sponsorsService.updateById(+channelId, {
      type: channelType,
    });

    await ctx
      .editMessageText(BotAdminMessages.channel(updatedChannel, currency), {
        parse_mode: 'HTML',
        link_preview_options: {
          is_disabled: true,
        },
        reply_markup: {
          inline_keyboard: adminChannelKeyboard(updatedChannel),
        },
      })
      .catch(async () => {
        await ctx.reply(BotAdminMessages.channels, {
          parse_mode: 'HTML',
          link_preview_options: {
            is_disabled: true,
          },
          reply_markup: {
            inline_keyboard: adminChannelKeyboard(updatedChannel),
          },
        });
      });

    return;
  }

  @Action(/toggle-active-channel\|(\d+)$/)
  @CheckAdmin()
  async toggleActiveChannel(@Ctx() ctx: SceneContext) {
    const channelId = getValueFromAction(ctx, 1);
    const channel = await this.sponsorsService.findById(+channelId);

    if (!channel) {
      return;
    }

    const currency = this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY);

    const updatedChannel = await this.sponsorsService.updateById(+channelId, {
      isActive: !channel.isActive,
    });

    await ctx
      .editMessageText(BotAdminMessages.channel(updatedChannel, currency), {
        parse_mode: 'HTML',
        link_preview_options: {
          is_disabled: true,
        },
        reply_markup: {
          inline_keyboard: adminChannelKeyboard(updatedChannel),
        },
      })
      .catch(async () => {
        await ctx.reply(BotAdminMessages.channels, {
          parse_mode: 'HTML',
          link_preview_options: {
            is_disabled: true,
          },
          reply_markup: {
            inline_keyboard: adminChannelKeyboard(updatedChannel),
          },
        });
      });

    return;
  }
}
