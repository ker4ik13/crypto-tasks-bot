import { Injectable } from '@nestjs/common';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class BotService {
  // constructor(private readonly usersService: UsersService) {}
  async sendMessageByChatId(
    bot: Telegraf<Context>,
    chatId: number,
    message: string,
  ) {
    return await bot.telegram.sendMessage(chatId, message, {
      parse_mode: 'HTML',
    });
  }

  // async addNewUser(user: CreateUserDto) {
  //   try {
  //     const isUserExist = await this.usersService.findById(user.id);

  //     if (isUserExist) {
  //       return isUserExist;
  //     }

  //     return await this.usersService.create(user);
  //   } catch (error) {
  //     return await this.usersService.create(user);
  //   }
  // }

  // async checkUserIsAdmin(user: User) {
  //   const isUserExist = await this.usersService.findById(user.id);

  //   if (isUserExist) {
  //     return isUserExist.isAdmin;
  //   }

  //   return false;
  // }

  // async findAllUsers() {
  //   return await this.usersService.findAll();
  // }

  // async sendAdminMessage(bot: Telegraf<Context>, message: IAdminMessage) {
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
  //       if (admin.isBot || !admin.settings.sendNewClaimMessages) {
  //         continue;
  //       }

  //       await bot.telegram.sendMessage(+admin.id.toString(), botMessage, {
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
