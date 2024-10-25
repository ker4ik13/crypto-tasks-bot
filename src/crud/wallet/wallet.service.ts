import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { UsersService } from '../users';

@Injectable()
export class WalletService {
  constructor(
    private readonly database: DatabaseService,
    private readonly usersService: UsersService,
  ) {}

  async getTotalWithdrawalAmount(): Promise<number> {
    const sum = await this.database.user.aggregate({
      _sum: {
        outputBalance: true,
      },
    });

    return sum._sum.outputBalance || 0;
  }

  async withdrawByTelegramId(
    telegramId: string,
    amount: number,
  ): Promise<User> {
    return await this.database.user.update({
      where: { telegramId },
      data: {
        currentBalance: {
          decrement: amount,
        },
        outputBalance: {
          increment: amount,
        },
      },
    });
  }
}
