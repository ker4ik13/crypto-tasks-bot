import { BotAlerts } from '@/bot/messages';
import { getNormalChatId } from '@/lib/helpers';
import { HistoryPaginationType, ICustomError } from '@/lib/types';
import { Injectable } from '@nestjs/common';
import type { Prisma, SponsorChannel, User } from '@prisma/client';
import type { Context } from 'telegraf';
import type { SceneContext, WizardContext } from 'telegraf/scenes';
import { DatabaseService } from '../database/database.service';
import { UsersService } from '../users';
import { WalletService } from '../wallet';

@Injectable()
export class SponsorsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly usersService: UsersService,
    private readonly walletService: WalletService,
  ) {}

  async create(
    dto: Prisma.SponsorChannelCreateInput,
  ): Promise<SponsorChannel & { subsUsers: User[] }> {
    return await this.database.sponsorChannel.create({
      data: {
        ...dto,
        createdDate: new Date().toISOString(),
        expirationDate: new Date(dto.expirationDate).toISOString(),
      },
      include: {
        subsUsers: true,
        _count: {
          select: { subsUsers: true },
        },
      },
    });
  }

  async findAll(): Promise<
    (SponsorChannel & { _count: { subsUsers: number } })[] | null
  > {
    return await this.database.sponsorChannel.findMany({
      orderBy: [{ isActive: 'desc' }, { createdDate: 'desc' }],
      include: {
        _count: {
          select: { subsUsers: true },
        },
      },
    });
  }

  async findAllForAdmin(
    page: number,
    limit = 10,
  ): Promise<
    HistoryPaginationType<SponsorChannel & { _count: { subsUsers: number } }>
  > {
    const channels = await this.database.sponsorChannel.findMany({
      take: limit,
      skip: limit * (page - 1),
      orderBy: [{ isActive: 'desc' }, { createdDate: 'desc' }],
      include: {
        _count: {
          select: { subsUsers: true },
        },
      },
    });

    return {
      hasNextPage:
        page < Math.ceil((await this.database.sponsorChannel.count()) / limit),
      hasPreviousPage: page > 1,
      page,
      pageItems: channels,
      pages: Math.ceil((await this.database.sponsorChannel.count()) / limit),
    };
  }

  async getStats(): Promise<SponsorChannel[]> {
    const allChannels = await this.database.sponsorChannel.findMany({
      orderBy: [{ isActive: 'desc' }, { createdDate: 'desc' }],
      include: {
        _count: {
          select: { subsUsers: true },
        },
      },
    });

    return allChannels;
  }

  async findStart(): Promise<SponsorChannel[] | null> {
    return await this.database.sponsorChannel.findMany({
      where: {
        AND: {
          isActive: {
            equals: true,
          },
          OR: [{ type: 'start' }, { type: 'all' }],
        },
        expirationDate: {
          gte: new Date().toISOString(),
        },
      },
      orderBy: { expirationDate: 'asc' },
      include: {
        _count: {
          select: { subsUsers: true },
        },
      },
    });
  }

  async findTasks(): Promise<SponsorChannel[] | null> {
    return await this.database.sponsorChannel.findMany({
      where: {
        AND: {
          isActive: {
            equals: true,
          },
          OR: [{ type: 'task' }, { type: 'all' }],
        },
        expirationDate: {
          gte: new Date().toISOString(),
        },
      },
      orderBy: { expirationDate: 'asc' },
      include: {
        _count: {
          select: { subsUsers: true },
        },
      },
    });
  }

  async findById(
    id: number,
  ): Promise<(SponsorChannel & { subsUsers: User[] }) | null> {
    if (!id) return null;

    const channel = await this.database.sponsorChannel.findUnique({
      where: { id },
      include: {
        subsUsers: true,
        _count: {
          select: { subsUsers: true },
        },
      },
    });

    if (!channel) {
      return null;
    }

    return channel;
  }

  async findBySlug(
    slug: string,
  ): Promise<(SponsorChannel & { subsUsers: User[] }) | null> {
    if (!slug) return null;

    const channel = await this.database.sponsorChannel.findUnique({
      where: { channelSlug: slug },
      include: {
        subsUsers: true,
        _count: {
          select: { subsUsers: true },
        },
      },
    });

    if (!channel) {
      return null;
    }

    return channel;
  }

  async getTaskForUser(telegramId: string) {
    const neededTask = await this.database.sponsorChannel.findFirst({
      where: {
        isActive: {
          equals: true,
        },
        type: {
          in: ['all', 'task'],
        },
        expirationDate: {
          gte: new Date().toISOString(),
        },
        NOT: {
          subsUsers: {
            some: {
              telegramId: telegramId,
            },
          },
        },
      },
    });

    if (!neededTask) {
      return null;
    }

    return neededTask;
  }

  async checkUserSubscription(
    ctx: Context | WizardContext | SceneContext,
    channelSlug: string,
  ): Promise<ICustomError> {
    try {
      // Проверка на повторную проверку
      const channel = await this.findBySlug(channelSlug);
      if (
        channel.subsUsers.some(
          (user) => user.telegramId === ctx.from.id.toString(),
        )
      ) {
        return {
          isError: true,
          message: BotAlerts.alreadySubscribed,
        };
      }

      const member = await ctx.telegram.getChatMember(
        getNormalChatId(channelSlug),
        ctx.from.id,
      );

      if (
        member.status != 'member' &&
        member.status != 'administrator' &&
        member.status != 'creator'
      ) {
        return {
          isError: true,
          message: BotAlerts.notSubscribed,
        };
      }

      this.updateBySlug(channelSlug, {
        subsUsers: {
          connect: {
            telegramId: ctx.from.id.toString(),
          },
        },
      });

      return {
        isError: false,
      };
    } catch (error) {
      console.log(
        `Ошибка в sponsors.service.ts:checkUserSubscription\n\n${error}\n\nКанал: ${channelSlug}, пользователь: ${ctx.from.id}. Канал временно отключен.`,
      );
      await this.updateBySlug(channelSlug, {
        isActive: false,
      });
      return {
        isError: true,
        message: `Ошибка в sponsors.service.ts:checkUserSubscription\n\n${error}\n\nКанал: ${channelSlug}, пользователь: ${ctx.from.id}. Канал временно отключен.`,
      };
    }
  }

  async addRewardToUser(dto: { userId: string; channel: SponsorChannel }) {
    const updatedUser =
      await this.walletService.addRewardToUserFromSubscription(
        dto.userId,
        dto.channel,
      );

    return updatedUser;
  }

  async updateById(
    id: number,
    dto: Prisma.SponsorChannelUpdateInput,
  ): Promise<SponsorChannel & { subsUsers: User[] }> {
    return await this.database.sponsorChannel.update({
      where: { id },
      data: {
        ...dto,
      },
      include: {
        subsUsers: true,
        _count: {
          select: { subsUsers: true },
        },
      },
    });
  }

  async updateBySlug(
    slug: string,
    dto: Prisma.SponsorChannelUpdateInput,
  ): Promise<SponsorChannel> {
    return await this.database.sponsorChannel.update({
      where: { channelSlug: slug },
      data: {
        ...dto,
      },
      include: {
        _count: {
          select: { subsUsers: true },
        },
      },
    });
  }

  async removeById(id: number): Promise<SponsorChannel> {
    return await this.database.sponsorChannel.delete({
      where: { id },
    });
  }
  async removeBySlug(slug: string): Promise<SponsorChannel> {
    return await this.database.sponsorChannel.delete({
      where: { channelSlug: slug },
    });
  }
}
