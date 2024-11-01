import { CheckAdmin } from '@/auth/decorators';
import { SponsorsService } from '@/crud';
import { UsersAdminService } from '@/crud/users/users-admin.service';
import { UsersFindService } from '@/crud/users/users-find.service';
import { ENV_NAMES } from '@/lib/common';
import { getValueFromAction } from '@/lib/helpers';
import { emojis } from '@/lib/utils';
import { ConfigService } from '@nestjs/config';
import { SponsorChannel, User } from '@prisma/client';
import { Action, Ctx, Hears, Message, Update } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/scenes';
import { BotService } from '../../bot.service';
import {
  adminChannelKeyboard,
  adminChannelsKeyboard,
  adminMenuKeyboard,
  adminUserKeyboard,
  adminUsersKeyboard,
  adminUsersStatsKeyboard,
} from '../../keyboards/admin';
import { BotAdminMessages } from '../../messages';

@Update()
export class AdminUpdate {
  page = 1;
  channel: SponsorChannel & { subsUsers: User[] };

  constructor(
    private readonly botService: BotService,
    private readonly usersFindService: UsersFindService,
    private readonly usersAdminService: UsersAdminService,
    private readonly configService: ConfigService,
    private readonly sponsorsService: SponsorsService,
  ) {}

  @Action('admin')
  @CheckAdmin()
  async adminMenu(@Ctx() ctx: SceneContext) {
    const user = await this.usersFindService.findByTelegramId(
      ctx.from.id.toString(),
    );
    await ctx
      .editMessageText(BotAdminMessages.menu(user), {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: adminMenuKeyboard(),
        },
      })
      .catch(async () => {
        await ctx.reply(BotAdminMessages.menu(user), {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: adminMenuKeyboard(),
          },
        });
      });
    return;
  }

  @Action('users-stats')
  @CheckAdmin()
  async usersStats(@Ctx() ctx: SceneContext) {
    const stats = await this.usersFindService.getStats();

    await ctx
      .editMessageText(
        `${emojis.stat} Статистика по пользователям\n\n${BotAdminMessages.mailingStatistics(stats).text}`,
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: adminUsersStatsKeyboard(),
          },
        },
      )
      .catch(async () => {
        await ctx.reply(
          `${emojis.stat} Статистика по пользователям\n\n${BotAdminMessages.mailingStatistics(stats).text}`,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: adminUsersStatsKeyboard(),
            },
          },
        );
      });
    return;
  }

  @Hears(/admin-channels\|(\d+)/)
  @Action(/admin-channels\|(\d+)/)
  @CheckAdmin()
  async adminChannels(
    @Ctx() ctx: SceneContext,
    @Message('text') message: string,
  ) {
    let page = 1;

    if (message) {
      page = +message.split('|')[1] || 1;
    } else {
      page = +getValueFromAction(ctx, 1) || 1;
    }
    this.page = page;

    const allChannels = await this.sponsorsService.findAllForAdmin(page);

    const currency = this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY);

    await ctx
      .editMessageText(BotAdminMessages.channels, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: adminChannelsKeyboard(allChannels, currency),
        },
      })
      .catch(async () => {
        await ctx.reply(BotAdminMessages.channels, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: adminChannelsKeyboard(allChannels, currency),
          },
        });
      });

    return;
  }

  @Action(/current-channel\|(\d+)/)
  @CheckAdmin()
  async adminCurrentChannel(@Ctx() ctx: SceneContext) {
    const channelId = getValueFromAction(ctx, 1);
    const channel = await this.sponsorsService.findById(+channelId);

    if (!channel) {
      return;
    }

    this.channel = channel;

    const currency = this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY);

    await ctx
      .editMessageText(BotAdminMessages.channel(channel, currency), {
        parse_mode: 'HTML',
        link_preview_options: {
          is_disabled: true,
        },
        reply_markup: {
          inline_keyboard: adminChannelKeyboard(channel, this.page),
        },
      })
      .catch(async () => {
        await ctx.reply(BotAdminMessages.channel(channel, currency), {
          parse_mode: 'HTML',
          link_preview_options: {
            is_disabled: true,
          },
          reply_markup: {
            inline_keyboard: adminChannelKeyboard(channel, this.page),
          },
        });
      });

    return;
  }

  @Hears(/admin|users\|(\d+)/)
  @Action(/admin|users\|(\d+)/)
  @CheckAdmin()
  async adminUsers(@Ctx() ctx: SceneContext, @Message('text') message: string) {
    let page = 1;

    if (message) {
      page = +message.split('|')[2] || 1;
    } else {
      page = +getValueFromAction(ctx, 2) || 1;
    }
    this.page = page;

    const users = await this.usersFindService.findAllForAdmin(+page);

    if (!users) {
      return;
    }

    const currency = this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY);

    await ctx
      .editMessageText(BotAdminMessages.users, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: adminUsersKeyboard(users, currency),
        },
      })
      .catch(async () => {
        await ctx.reply(BotAdminMessages.users, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: adminUsersKeyboard(users, currency),
          },
        });
      });

    return;
  }

  @Action(/current-user\|(\d+)/)
  @CheckAdmin()
  async adminCurrentUser(@Ctx() ctx: SceneContext) {
    const userId = getValueFromAction(ctx, 1);
    const user = await this.usersAdminService.findByTelegramId(userId);

    if (!user) {
      return;
    }

    const currency = this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY);

    await ctx
      .editMessageText(BotAdminMessages.user(user, currency), {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: adminUserKeyboard(user, this.page),
        },
      })
      .catch(async () => {
        await ctx.reply(BotAdminMessages.user(user, currency), {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: adminUserKeyboard(user, this.page),
          },
        });
      });

    return;
  }

  @Action('delete-channel')
  @CheckAdmin()
  async deleteChannelEnterScene(@Ctx() ctx: SceneContext) {
    await ctx.scene.enter('delete-channel', {
      channel: this.channel,
    });
    return;
  }

  @Action('create-channel')
  @CheckAdmin()
  async createChannelEnterScene(@Ctx() ctx: SceneContext) {
    await ctx.scene.enter('create-channel');
    return;
  }
}
