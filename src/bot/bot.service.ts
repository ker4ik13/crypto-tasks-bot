import { SponsorsService, UsersService } from '@/crud';
import {
  CHATS,
  DEFAULT_CURRENCY,
  DEFAULT_REWARD_FOR_A_FRIEND,
  ENV_NAMES,
} from '@/lib/common';
import { getNormalChatId } from '@/lib/helpers';
import { IAdminMessage } from '@/lib/types';
import { emojis } from '@/lib/utils';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SponsorChannel } from '@prisma/client';
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
    private readonly usersService: UsersService,
  ) {}

  async checkAllSubscriptions(
    ctx: SceneContext | Context,
  ): Promise<SponsorChannel[]> {
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
  ): Promise<SponsorChannel[]> {
    const notChannelSubs = await this.checkAllSubscriptions(ctx);

    if (notChannelSubs.length === 0) {
      if (mode === 'first') {
        await ctx.reply(
          BotMessages.welcome(
            this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY),
          ),
          {
            reply_markup: {
              inline_keyboard: mainKeyboard(),
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
          }
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

  async sendAdminMessage(message: IAdminMessage) {
    try {
      const admins = await this.usersService.findAllAdmins();

      if (!admins || !admins.length) {
        return;
      }

      let botMessage = `<b>${message.title}</b>\n`;

      for (const text in message.text) {
        botMessage += `\n<b>${text}</b>: ${message.text[text]}`;
      }

      for (const admin of admins) {
        // if (!admin.settings.sendNewClaimMessages) {
        //   continue;
        // }

        await this.bot.telegram.sendMessage(+admin.id.toString(), botMessage, {
          parse_mode: 'HTML',
        });
      }

      return true;
    } catch (error) {
      return new BadGatewayException({
        message: 'Не удалось отправить сообщение админам',
      });
    }
  }
}
