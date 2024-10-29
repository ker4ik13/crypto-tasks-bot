import { ENV_NAMES } from '@/lib/common';
import { beautyCurrency } from '@/lib/helpers';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Mining, User } from '@prisma/client';
import { UsersFindService, UsersService } from '../users';

@Injectable()
export class MiningService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => UsersFindService))
    private readonly usersFindService: UsersFindService,
    private readonly configService: ConfigService,
  ) {}

  async refreshMining(telegramId: string) {
    const user = await this.usersFindService.findByTelegramId(telegramId);
    if (!user) return null;
    if (!user.mining) return null;

    const miningDiffTime =
      (new Date().getTime() -
        new Date(user.mining.dateOfLastReceipt).getTime()) /
      1000;

    const earnCount = miningDiffTime * user.mining.countPerSecond;

    return await this.usersService.updateByTelegramId(telegramId, {
      mining: {
        update: {
          currentBalance: +beautyCurrency(
            user.mining.currentBalance + earnCount,
            user.mining.countPerSecond.toString().split('.')[1].length,
          ),
          dateOfLastReceipt: new Date().toISOString(),
        },
      },
    });
  }

  async startMining(telegramId: string): Promise<User & { mining: Mining }> {
    const user = await this.usersFindService.findByTelegramId(telegramId);
    if (!user) return null;
    if (!user.mining) {
      return await this.createMining(telegramId);
    }

    if (user.mining) {
      return await this.usersService.updateByTelegramId(telegramId, {
        mining: {
          update: {
            isEnabled: true,
            dateOfLastReceipt: new Date().toISOString(),
          },
        },
      });
    }

    return await this.usersService.updateByTelegramId(telegramId, {
      mining: {
        create: {
          isEnabled: true,
          dateOfLastReceipt: new Date().toISOString(),
        },
      },
    });
  }

  async createMining(telegramId: string) {
    const user = await this.usersFindService.findByTelegramId(telegramId);
    if (!user) return null;

    const countPerSecond = await this.configService.get(
      ENV_NAMES.MINING_SIZE_PER_SECOND,
    );

    return await this.usersService.updateByTelegramId(telegramId, {
      mining: {
        create: {
          isEnabled: true,
          dateOfLastReceipt: new Date().toISOString(),
          countPerSecond: +countPerSecond,
        },
      },
    });
  }

  async collectMining(
    telegramId: string,
  ): Promise<(User & { mining: Mining }) | null> {
    const user = await this.usersFindService.findByTelegramId(telegramId);
    if (!user) return null;
    if (!user.mining) return null;

    const updatedUser = await this.usersService.updateByTelegramId(telegramId, {
      mining: {
        update: {
          isEnabled: true,
          currentBalance: 0,
          collectedBalance: +beautyCurrency(
            user.mining.collectedBalance + user.mining.currentBalance,
            user.mining.countPerSecond.toString().split('.')[1].length,
          ),
          dateOfLastReceipt: new Date().toISOString(),
        },
      },
      currentBalance: +beautyCurrency(
        user.currentBalance + user.mining.currentBalance,
      ),
    });

    return updatedUser;
  }
}
