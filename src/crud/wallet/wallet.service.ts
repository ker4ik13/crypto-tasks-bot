import { BotAdminMessages } from '@/bot/messages';
import { ENV_NAMES } from '@/lib/common';
import { beautyCurrency } from '@/lib/helpers';
import { Injectable, NotAcceptableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SponsorChannel, User } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { MessagesService } from '../messages';
import { UsersFindService, UsersService } from '../users';

@Injectable()
export class WalletService {
  constructor(
    private readonly database: DatabaseService,
    private readonly usersFindService: UsersFindService,
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
    private readonly configService: ConfigService,
  ) {}

  async getTotalWithdrawalAmount(): Promise<number> {
    const sum = await this.database.user.aggregate({
      _sum: {
        outputBalance: true,
      },
    });

    return sum._sum.outputBalance || 0;
  }

  async addRewardToUserFromSubscription(
    telegramId: string,
    channel: SponsorChannel,
  ) {
    const candidate = await this.usersFindService.findByTelegramId(telegramId);

    if (!candidate) return null;

    const updatedUser = await this.usersService.updateByTelegramId(telegramId, {
      currentBalance: +beautyCurrency(
        candidate.currentBalance + channel.reward,
      ),
    });

    return updatedUser;
  }

  async withdrawByTelegramId(
    telegramId: string,
    amount: number,
  ): Promise<User> {
    try {
      const candidate =
        await this.usersFindService.findByTelegramId(telegramId);

      if (!candidate) return null;

      const botCurrency = await this.configService.get(
        ENV_NAMES.TELEGRAM_BOT_CURRENCY,
      );

      if (amount > candidate.currentBalance) {
        await this.messagesService.sendAdminMessage(
          BotAdminMessages.noMoney(candidate, amount, botCurrency),
        );
        throw new NotAcceptableException('Недостаточно средств для вывода');
      }

      const updatedUser = await this.usersService.updateByTelegramId(
        telegramId,
        {
          currentBalance: +beautyCurrency(candidate.currentBalance - amount),
          outputBalance: +beautyCurrency(candidate.outputBalance + amount),
        },
      );

      // Сообщение о статистике пользователя
      await this.messagesService.sendAdminMessage(
        BotAdminMessages.successfulPayment(updatedUser, amount, botCurrency),
      );
    } catch (error) {
      throw new Error(BotAdminMessages.paymentError(telegramId, error));
    }
  }
}
