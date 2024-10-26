import { UserWithReferral } from '@/lib/types';
import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { Prisma, SponsorChannel, User } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { ReferralsService } from '../referrals';

@Injectable()
export class UsersService {
  constructor(
    private readonly database: DatabaseService,
    @Inject(forwardRef(() => ReferralsService))
    private readonly referralsService: ReferralsService,
  ) {}

  async create(dto: Prisma.UserCreateInput): Promise<User> {
    const isUserInclude = await this.database.user.findUnique({
      where: { telegramId: dto.telegramId.toString() },
    });

    if (isUserInclude) {
      throw new ConflictException('User already exists');
    }

    const newUser = await this.database.user.create({
      data: {
        ...dto,
      },
      include: {
        invitedBy: true,
        referral: true,
        payments: true,
      },
    });

    const newReferral = await this.referralsService.create({
      code: newUser.telegramId.toString(),
      owner: {
        connect: {
          telegramId: newUser.telegramId.toString(),
        },
      },
    });

    const returnedUser = await this.database.user.update({
      where: {
        id: newUser.id,
      },
      data: {
        referral: {
          connect: {
            id: newReferral.id,
          },
        },
      },
      include: {
        invitedBy: true,
        referral: {
          include: {
            invitedUsers: true,
            owner: true,
          },
        },
        payments: true,
      },
    });

    return returnedUser;
  }

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

  async addRewardToUserFromSubscription(
    telegramId: string,
    channel: SponsorChannel,
  ) {
    const updatedUser = await this.database.user.update({
      where: { telegramId },
      data: {
        currentBalance: {
          increment: channel.reward,
        },
      },
    });

    if (!updatedUser) return null;

    return updatedUser;
  }

  async findByTelegramId(telegramId: string): Promise<User | null> {
    if (!telegramId) return null;

    const user = await this.database.user.findUnique({
      where: { telegramId: telegramId.toString() },
      include: {
        referral: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findByIdWithReferral(id: number): Promise<UserWithReferral | null> {
    if (!id) return null;

    const user = await this.database.user.findUnique({
      where: { id },
      include: {
        referral: {
          include: {
            invitedUsers: true,
          },
        },
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
          },
        },
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

  async updateById(id: number, dto: Prisma.UserUpdateInput): Promise<User> {
    return await this.database.user.update({
      where: { id },
      data: dto,
    });
  }

  async removeById(id: number): Promise<User> {
    return await this.database.user.delete({
      where: { id },
    });
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
}
