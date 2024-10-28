import { warningKeyboard } from '@/bot/keyboards';
import { BotAdminMessages, BotMessages } from '@/bot/messages';
import { ENV_NAMES } from '@/lib/common';
import { ICustomError, UserWithReferral } from '@/lib/types';
import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma, User } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { MessagesService } from '../messages';
import { ReferralsService } from '../referrals';

@Injectable()
export class UsersService {
  constructor(
    private readonly database: DatabaseService,
    @Inject(forwardRef(() => ReferralsService))
    private readonly referralsService: ReferralsService,
    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,
    private readonly configService: ConfigService,
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
            _count: {
              select: {
                invitedUsers: true,
              },
            },
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
            _count: {
              select: {
                invitedUsers: true,
              },
            },
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
      include: {
        referral: {
          include: {
            _count: {
              select: {
                invitedUsers: true,
              },
            },
          },
        },
      },
    });
  }

  async updateByTelegramId(
    telegramId: string,
    dto: Prisma.UserUpdateInput,
  ): Promise<User> {
    return await this.database.user.update({
      where: { telegramId },
      data: dto,
      include: {
        referral: {
          include: {
            _count: {
              select: {
                invitedUsers: true,
              },
            },
          },
        },
      },
    });
  }

  async setNullBalanceByTelegramId(telegramId: string): Promise<User> {
    const updatedUser = await this.database.user.update({
      where: { telegramId },
      data: {
        currentBalance: 0,
        warningsCount: {
          increment: 1,
        },
      },
      include: {
        referral: {
          include: {
            _count: {
              select: {
                invitedUsers: true,
              },
            },
          },
        },
      },
    });

    if (!updatedUser) {
      await this.messagesService.sendAdminMessage(
        BotAdminMessages.setNullBalanceNotFoundUser(telegramId),
      );
      throw new NotFoundException(
        BotAdminMessages.setNullBalanceError(telegramId),
      );
    }

    const admin = await this.configService.get(ENV_NAMES.ADMIN_USERNAME);
    const maxWarningCount = await this.configService.get(
      ENV_NAMES.MAX_WARNING_COUNT,
    );
    const currency = await this.configService.get(
      ENV_NAMES.TELEGRAM_BOT_CURRENCY,
    );

    await this.messagesService.sendMessageByChatId(
      +telegramId,
      BotMessages.setNullBalance(updatedUser, maxWarningCount, currency, admin),
      {
        inline_keyboard: warningKeyboard(),
      },
    );

    return;
  }

  async checkWarnings(telegramId: string): Promise<ICustomError> {
    const user = await this.database.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      return {
        isError: false,
      };
    }

    const maxWarningCount = await this.configService.get(
      ENV_NAMES.MAX_WARNING_COUNT,
    );
    const admin = await this.configService.get(ENV_NAMES.ADMIN_USERNAME);

    if (user.warningsCount >= maxWarningCount) {
      return {
        isError: true,
        message: BotMessages.maxWarnings(user, maxWarningCount, admin),
      };
    }

    return {
      isError: false,
    };
  }

  async removeById(id: number): Promise<User> {
    return await this.database.user.delete({
      where: { id },
      include: {
        referral: {
          include: {
            _count: {
              select: {
                invitedUsers: true,
              },
            },
          },
        },
      },
    });
  }
}
