import { DEFAULT_CURRENCY, DEFAULT_REWARD_FOR_A_FRIEND } from '@/lib/common';
import { ICustomMessage } from '@/lib/types';
import { emojis } from '@/lib/utils';
import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { DatabaseService } from '../database';

@Injectable()
export class MessagesService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly database: DatabaseService,
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
      orderBy: { createdDate: 'desc' },
      include: {
        referral: {
          include: {
            invitedUsers: true,
          },
        },
      },
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

    // Если есть фото и их больше 1 или 1
    if (message.photos && message.photos.length >= 1) {
      for (const user of users) {
        // Если заблокировал бота
        if (user.isBlockedTheBot) {
          return;
        }

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
          } catch (error) {
            await this.database.user.update({
              where: { id: user.id },
              data: { isBlockedTheBot: true },
            });
            console.log(
              `Пользователь ${user.telegramId} (@${user.username}) не получил сообщения из за блокировки бота`,
            );
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
          } catch (error) {
            await this.database.user.update({
              where: { id: user.id },
              data: { isBlockedTheBot: true },
            });
            console.log(
              `Пользователь ${user.telegramId} (@${user.username}) не получил сообщения из за блокировки бота`,
            );
          }
        }
      }
      return;
    }

    for (const user of users) {
      try {
        await this.bot.telegram.sendMessage(+user.telegramId, message.message, {
          parse_mode: 'HTML',
          reply_markup: replyKeyboard,
        });
      } catch (error) {
        await this.database.user.update({
          where: { id: user.id },
          data: { isBlockedTheBot: true },
        });
        console.log(
          `Пользователь ${user.telegramId} (@${user.username}) не получил сообщения из за блокировки бота`,
        );
      }
    }

    return;
  }

  async sendMessageByChatId(chatId: number, message: string) {
    // return await bot.telegram.sendMessage(chatId, message, {
    //   parse_mode: 'HTML',
    // });
    try {
      await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.log(
        `Пользователь ${chatId} не получил сообщения из за блокировки бота`,
      );
    }

    return;
  }

  // async sendAdminMessage(message: IAdminMessage) {
  //   try {
  //     const admins = await this.usersService.findAllAdmins();

  //     if (!admins || !admins.length) {
  //       return;
  //     }

  //     let botMessage = `<b>${message.title}</b>\n`;

  //     for (const text in message.text) {
  //       botMessage += `\n<b>${text}</b>: ${message.text[text]}`;
  //     }

  //     for (const admin of admins) {
  //       // if (!admin.settings.sendNewClaimMessages) {
  //       //   continue;
  //       // }

  //       await this.bot.telegram.sendMessage(+admin.id.toString(), botMessage, {
  //         parse_mode: 'HTML',
  //       });
  //     }

  //     return true;
  //   } catch (error) {
  //     return new BadGatewayException({
  //       message: 'Не удалось отправить сообщение админам',
  //     });
  //   }
  // }
}
