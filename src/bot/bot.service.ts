import { SponsorsService } from '@/crud';
import { UsersFindService } from '@/crud/users/users-find.service';
import {
  CHATS,
  DEFAULT_CURRENCY,
  DEFAULT_REWARD_FOR_A_FRIEND,
  ENV_NAMES,
} from '@/lib/common';
import { getNormalChatId } from '@/lib/helpers';
import { emojis } from '@/lib/utils';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SponsorChannel, User } from '@prisma/client';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { SceneContext } from 'telegraf/scenes';
import { channelsKeyboard, mainKeyboard } from './keyboards';
import { BotMessages } from './messages';

@Injectable()
export class BotService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly sponsorsService: SponsorsService,
    private readonly configService: ConfigService,
    private readonly usersFindService: UsersFindService,
  ) {}

  async checkAllSubscriptions(
    ctx: SceneContext | Context,
    user?: User,
  ): Promise<SponsorChannel[]> {
    if (user && user.isAdmin) {
      return [];
    }

    const sponsorsChannels = await this.sponsorsService.findStart();

    if (!sponsorsChannels) {
      return [];
    }

    const notSubsChannels = await this.mapChannels(ctx, sponsorsChannels);

    return notSubsChannels;
  }

  async checkChannelsSubs(
    ctx: SceneContext | Context,
    mode: 'first' | 'next' = 'next',
    user?: User,
  ): Promise<SponsorChannel[]> {
    const notChannelSubs = await this.checkAllSubscriptions(ctx, user);

    if (notChannelSubs.length === 0) {
      if (mode === 'first') {
        await ctx.reply(
          BotMessages.welcome(
            this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY),
          ),
          {
            reply_markup: {
              inline_keyboard: mainKeyboard(user),
            },
          },
        );

        return [];
      }

      return [];
    }

    if (notChannelSubs.length > 0) {
      await ctx.reply(BotMessages.pleaseAuth, {
        reply_markup: {
          inline_keyboard: channelsKeyboard(notChannelSubs),
        },
      });

      return;
    }

    await ctx.reply(BotMessages.authDone, {
      reply_markup: {
        inline_keyboard: mainKeyboard(),
      },
    });
    return;
  }

  async mapChannels(ctx: Context | SceneContext, channels: SponsorChannel[]) {
    try {
      const notSubsChannels: SponsorChannel[] = [];

      for (const channel of channels) {
        try {
          const member = await ctx.telegram.getChatMember(
            getNormalChatId(channel.channelSlug),
            ctx.from.id,
          );

          if (
            member.status != 'member' &&
            member.status != 'administrator' &&
            member.status != 'creator'
          ) {
            notSubsChannels.push(channel);

            this.sponsorsService.updateBySlug(channel.channelSlug, {
              subsUsers: {
                disconnect: {
                  telegramId: ctx.from.id.toString(),
                },
              },
            });
            continue;
          }

          this.sponsorsService.updateBySlug(channel.channelSlug, {
            subsUsers: {
              connect: {
                telegramId: ctx.from.id.toString(),
              },
            },
          });
        } catch (error) {
          for (const admin of CHATS) {
            await this.sendMessageByChatId(
              admin,
              `Ошибка при проверке каналов на подписки. Возможно, бот не добавлен в администраторы канала @${channel.channelSlug}\n\n${error}`,
            );
            console.log(error);
          }
        }
      }

      return notSubsChannels;
    } catch (error) {
      throw new Error(
        `Ошибка при проверке каналов на подписки. Возможно, бот не добавлен в администраторы канала.\n\n${error}`,
      );
    }
  }

  async sendMessageNewReferral(
    ownerTelegramId: string,
    reward = DEFAULT_REWARD_FOR_A_FRIEND,
    currency = DEFAULT_CURRENCY,
  ) {
    const message = `<b>${emojis.bagOfMoney} Начислено ${reward} ${currency}!</b>`;
    await this.bot.telegram.sendMessage(+ownerTelegramId, message, {
      parse_mode: 'HTML',
    });

    return;
  }

  async sendMessageByChatId(
    // bot: Telegraf<Context>,
    chatId: number,
    message: string,
  ) {
    // return await bot.telegram.sendMessage(chatId, message, {
    //   parse_mode: 'HTML',
    // });
    return this.bot.telegram.sendMessage(chatId, message, {
      parse_mode: 'HTML',
    });
  }
}
