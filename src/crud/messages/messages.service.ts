import { BotAdminMessages } from '@/bot/messages';
import { DEFAULT_CURRENCY, DEFAULT_REWARD_FOR_A_FRIEND } from '@/lib/common';
import { IAdminMessage, ICustomMessage } from '@/lib/types';
import { emojis } from '@/lib/utils';
import {
  BadGatewayException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import {
  ForceReply,
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from 'telegraf/typings/core/types/typegram';
import { DatabaseService } from '../database';
import { UsersService } from '../users';
import { UsersFindService } from '../users/users-find.service';

type MarkupType =
  | InlineKeyboardMarkup
  | ReplyKeyboardMarkup
  | ReplyKeyboardRemove
  | ForceReply;

@Injectable()
export class MessagesService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly database: DatabaseService,
    @Inject(forwardRef(() => UsersFindService))
    private readonly usersFindService: UsersFindService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

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

  // Массовая рассылка
  async sendMessageAllUsers(message: ICustomMessage) {
    const users = await this.database.user.findMany({
      where: {
        isBlockedTheBot: {
          equals: false,
        },
      },
      orderBy: { createdDate: 'desc' },
    });

    if (!users || users.length === 0) {
      return;
    }

    const replyKeyboard =
      message.buttons && message.buttons.length > 0
        ? {
            inline_keyboard: [
              ...message.buttons.map((button) => {
                return [Markup.button.url(button.text, button.url)];
              }),
            ],
          }
        : undefined;

    let successSend = 0;

    try {
      // Если есть фото и их больше 1 или 1
      if (message.photos && message.photos.length >= 1) {
        for (const user of users) {
          if (message.photos.length === 1) {
            try {
              await this.bot.telegram.sendPhoto(
                +user.telegramId,
                {
                  url: message.photos[0].url,
                },
                {
                  caption: message.message,
                  parse_mode: 'HTML',
                  reply_markup: replyKeyboard,
                },
              );

              successSend++;
            } catch (error) {
              await this.usersService.updateById(user.id, {
                isBlockedTheBot: true,
              });
              console.log(BotAdminMessages.mailingDontSendBeacuseBlocked(user));
            }
          } else {
            try {
              await this.bot.telegram.sendMediaGroup(
                +user.telegramId,
                message.photos.map((photo, index) => {
                  return {
                    media: photo.url,
                    type: photo.type,
                    caption: index === 0 ? photo.caption : undefined,
                  };
                }),
                {
                  parse_mode: 'HTML',
                  reply_markup: replyKeyboard,
                } as any,
              );

              successSend++;
            } catch (error) {
              await this.usersService.updateById(user.id, {
                isBlockedTheBot: true,
              });
              console.log(BotAdminMessages.mailingDontSendBeacuseBlocked(user));
            }
          }
        }
      } else {
        for (const user of users) {
          try {
            await this.bot.telegram.sendMessage(
              +user.telegramId,
              message.message,
              {
                parse_mode: 'HTML',
                reply_markup: replyKeyboard,
              },
            );

            successSend++;
          } catch (error) {
            await this.usersService.updateById(user.id, {
              isBlockedTheBot: true,
            });
            console.log(BotAdminMessages.mailingDontSendBeacuseBlocked(user));
          }
        }
      }
    } catch (error) {
      console.log(`Ошибка при рассылки по всем пользователям\n\n${error}`);
      await this.sendAdminMessage(BotAdminMessages.mailingError(error));
    }

    const admins = await this.usersFindService.findAllAdmins();

    if (!admins || admins.length === 0) {
      return;
    }

    // Статистика по пользователям
    const activeUsers = await this.usersFindService.findAllActiveUsers();
    const usersWhoBlockedTheBot =
      await this.usersFindService.findAllUsersBlockedTheBot();
    const usersWithoutReferral =
      await this.usersFindService.findWithoutReferrals();

    await this.sendAdminMessage(
      BotAdminMessages.mailingStatistics(
        activeUsers,
        usersWhoBlockedTheBot,
        successSend,
        usersWithoutReferral,
      ),
    );

    return;
  }

  async sendMessageByChatId(
    chatId: number,
    message: string,
    markup?: MarkupType,
  ) {
    try {
      await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        reply_markup: markup,
      });
    } catch (error) {
      console.log(
        `Пользователь ${chatId} не получил сообщения из за блокировки бота.\n\n${error}`,
      );
    }

    return;
  }

  async sendAdminMessage(message: IAdminMessage, markup?: MarkupType) {
    try {
      const admins = await this.usersFindService.findAllAdmins();

      if (!admins || !admins.length) {
        return;
      }

      const botMessage = `<b>${message.title}</b>\n\n${message.text}`;

      for (const admin of admins) {
        // if (!admin.settings.sendNewClaimMessages) {
        //   continue;
        // }

        await this.bot.telegram.sendMessage(+admin.telegramId, botMessage, {
          parse_mode: 'HTML',
          reply_markup: markup,
        });
      }

      return true;
    } catch (error) {
      return new BadGatewayException({
        message: `Не удалось отправить сообщение админам.\n\n${error}`,
      });
    }
  }
}
