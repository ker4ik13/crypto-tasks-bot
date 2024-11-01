import { strongBeautyCurrency } from '@/lib/helpers';
import {
  HistoryPaginationType,
  LabelValue,
  UserWithReferral,
} from '@/lib/types';
import { Injectable } from '@nestjs/common';
import type { Mining, User } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersFindService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(): Promise<User[] | null> {
    return await this.database.user.findMany({
      orderBy: { createdDate: 'desc' },
      include: {
        referral: {
          include: {
            invitedUsers: true,
          },
        },
      },
    });
  }

  async findAllForAdmin(
    page: number,
    limit = 10,
  ): Promise<HistoryPaginationType<UserWithReferral>> {
    const users = await this.database.user.findMany({
      take: limit,
      skip: limit * (page - 1),
      orderBy: [
        {
          currentBalance: 'desc',
        },
        {
          referral: { invitedUsers: { _count: 'desc' } },
        },
        {
          isBlockedTheBot: 'asc',
        },
        { createdDate: 'desc' },
      ],
      include: {
        referral: {
          include: {
            invitedUsers: true,
          },
        },
      },
    });

    return {
      hasNextPage: page < Math.ceil((await this.database.user.count()) / limit),
      hasPreviousPage: page > 1,
      page,
      pageItems: users,
      pages: Math.ceil((await this.database.user.count()) / limit),
    };
  }

  async findAllAdmins(): Promise<(User | null)[]> {
    return await this.database.user.findMany({
      where: {
        isAdmin: {
          equals: true,
        },
      },
    });
  }

  async findAllActiveUsers() {
    return await this.database.user.count({
      where: {
        currentBalance: {
          not: 0,
        },
        isBlockedTheBot: {
          equals: false,
        },
      },
    });
  }

  async findAllNotBlockedUsers() {
    return await this.database.user.findMany({
      where: {
        isBlockedTheBot: {
          equals: false,
        },
      },
    });
  }

  async findAllUsersBlockedTheBot() {
    return await this.database.user.count({
      where: {
        isBlockedTheBot: {
          equals: true,
        },
      },
    });
  }

  async findWithoutReferrals() {
    return await this.database.user.count({
      where: {
        referral: {
          invitedUsers: {
            none: {},
          },
        },
      },
    });
  }

  async findById(id: number): Promise<User | null> {
    if (!id) return null;

    const user = await this.database.user.findUnique({
      where: { id },
      include: {
        referral: {
          include: {
            _count: true,
          },
        },
        sponsorChannels: true,
        mining: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async getTotalCountOfUsers(): Promise<number> {
    return await this.database.user.count();
  }

  async getTotalWithdrawalAmount(): Promise<number> {
    const sum = await this.database.user.aggregate({
      _sum: {
        outputBalance: true,
      },
    });

    return sum._sum.outputBalance || 0;
  }

  async getStats(): Promise<LabelValue[]> {
    const totalCountOfUsers = await this.getTotalCountOfUsers();
    const activeUsers = await this.findAllActiveUsers();
    const usersWhoBlockedTheBot = await this.findAllUsersBlockedTheBot();
    const usersWithoutReferral = await this.findWithoutReferrals();

    return [
      {
        label: 'Всего пользователей',
        value: totalCountOfUsers.toString(),
      },
      {
        label: 'Активные пользователи',
        value: `${activeUsers.toString()} | ${strongBeautyCurrency((activeUsers / totalCountOfUsers) * 100, 2)}%`,
      },
      {
        label: 'Пользователи без рефералов',
        value: `${usersWithoutReferral.toString()} | ${strongBeautyCurrency(
          (usersWithoutReferral / totalCountOfUsers) * 100,
          2,
        )}%`,
      },
      {
        label: 'Пользователи, заблокировавшие бота',
        value: `${usersWhoBlockedTheBot.toString()} | ${strongBeautyCurrency(
          (usersWhoBlockedTheBot / totalCountOfUsers) * 100,
          2,
        )}%`,
      },
    ];
  }

  async getTopRefsUsers(limit = 15): Promise<UserWithReferral[]> {
    return await this.database.user.findMany({
      orderBy: { referral: { invitedUsers: { _count: 'desc' } } },
      where: {
        referral: {
          invitedUsers: {
            some: {}, // Проверяет, что хотя бы один элемент существует
          },
        },
      },
      include: {
        referral: {
          include: {
            invitedUsers: true,
          },
        },
      },
      take: limit,
    });
  }

  async findByTelegramId(
    telegramId: string,
  ): Promise<(User & { mining: Mining }) | null> {
    if (!telegramId) return null;

    const user = await this.database.user.findUnique({
      where: { telegramId: telegramId.toString() },
      include: {
        referral: true,
        mining: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findByIdWithReferral(
    id: number,
  ): Promise<(UserWithReferral & { mining: Mining }) | null> {
    if (!id) return null;

    const user = await this.database.user.findUnique({
      where: { id },
      include: {
        referral: {
          include: {
            invitedUsers: true,
            _count: {
              select: {
                invitedUsers: true,
              },
            },
          },
        },
        mining: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findByTelegramIdWithReferral(
    telegramId: string,
  ): Promise<UserWithReferral | null> {
    if (!telegramId) return null;

    const user = await this.database.user.findUnique({
      where: { telegramId },
      include: {
        referral: {
          include: {
            invitedUsers: true,
            _count: {
              select: {
                invitedUsers: true,
              },
            },
          },
        },
        mining: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async isUserExist(telegramId: number): Promise<boolean> {
    const user = await this.database.user.findUnique({
      where: { telegramId: telegramId.toString() },
      include: {
        invitedBy: true,
        referral: true,
        payments: true,
      },
    });

    if (!user) return false;
    if (!user.id) return false;

    if (user.isBlockedTheBot) {
      await this.database.user.update({
        where: { id: user.id },
        data: { isBlockedTheBot: false },
      });
    }

    return true;
  }

  async isUserAdmin(id: number): Promise<boolean> {
    const user = await this.database.user.findUnique({
      where: {
        id,
        isAdmin: {
          equals: true,
        },
      },
    });

    if (!user || !user.id) {
      return false;
    }

    return user.isAdmin;
  }
}
