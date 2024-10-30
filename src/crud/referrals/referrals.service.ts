import { DEFAULT_REWARD_FOR_A_FRIEND, ENV_NAMES } from '@/lib/common';
import { beautyCurrency } from '@/lib/helpers';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma, Referral } from '@prisma/client';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { MessagesService } from '../messages';
import { UsersService } from '../users';

@Injectable()
export class ReferralsService {
  constructor(
    private readonly database: DatabaseService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,
  ) {}

  async create(dto: Prisma.ReferralCreateInput): Promise<Referral> {
    return await this.database.referral.create({
      data: dto,
      include: {
        invitedUsers: true,
        owner: true,
      },
    });
  }

  // Создание уникального пригласительного кода
  createOneCode() {
    return randomUUID();
  }

  async addUserToReferral(dto: {
    code: string;
    userId: number;
  }): Promise<Referral | null> {
    if (!dto.code || !dto.userId) return null;
    if (dto.code === dto.userId.toString()) return null;

    // Ищем владельца рефералки
    const ownerReferral = await this.database.referral.findUnique({
      where: {
        code: dto.code,
      },
      include: {
        invitedUsers: true,
      },
    });

    if (!ownerReferral) return null;

    // Самому себя нельзя рефералить
    if (dto.userId === ownerReferral.ownerId) {
      return null;
    }

    // Проверка на то, что он уже перешел по рефке раньше
    const isUserAlreadyInvited = ownerReferral.invitedUsers.some(
      (user) => user.telegramId === dto.userId.toString(),
    );

    if (isUserAlreadyInvited) return null;

    // Обновляем рефералку
    const updatedReferral = await this.database.referral.update({
      where: { code: dto.code },
      data: {
        invitedUsers: {
          connect: {
            telegramId: dto.userId.toString(),
          },
        },
      },
    });

    const rewardForAFriend = this.configService.get(
      ENV_NAMES.REWARD_FOR_A_FRIEND,
    );

    // Добавляем награду владельцу
    await this.addRewardToUser({
      ...dto,
      reward: +rewardForAFriend,
    });
    return updatedReferral;
  }

  async addRewardToUser(dto: {
    code: string;
    userId: number;
    reward?: number;
  }) {
    if (!dto.reward) {
      dto.reward = DEFAULT_REWARD_FOR_A_FRIEND;
    }

    // Ищем владельца рефералки
    const codeOwner = await this.database.referral.findUnique({
      where: { code: dto.code },
      include: {
        owner: true,
      },
    });
    if (!codeOwner) return;

    const updatedUser = await this.usersService.updateById(codeOwner.owner.id, {
      currentBalance: {
        increment: +beautyCurrency(dto.reward),
      },
    });

    if (updatedUser && updatedUser.id) {
      await this.messagesService.sendMessageNewReferral(
        updatedUser.telegramId,
        dto.reward,
        this.configService.get(ENV_NAMES.TELEGRAM_BOT_CURRENCY),
      );
    }

    return updatedUser;
  }

  async findAll(): Promise<Referral[] | null> {
    return await this.database.referral.findMany({
      orderBy: { id: 'desc' },
      include: {
        invitedUsers: true,
      },
    });
  }

  async findById(id: number): Promise<Referral | null> {
    if (!id) return null;

    const referral = await this.database.referral.findUnique({
      where: { id },
      include: { owner: true, invitedUsers: true },
    });

    if (!referral) {
      return null;
    }

    return referral;
  }

  async updateById(
    id: number,
    dto: Prisma.ReferralUpdateInput,
  ): Promise<Referral> {
    return await this.database.referral.update({
      where: { id },
      data: {
        ...dto,
      },
      include: {
        owner: true,
      },
    });
  }

  async removeById(id: number): Promise<Referral> {
    return await this.database.referral.delete({
      where: { id },
      include: {
        owner: true,
      },
    });
  }
}
