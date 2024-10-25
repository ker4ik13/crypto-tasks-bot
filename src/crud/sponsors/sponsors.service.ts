import { Injectable } from '@nestjs/common';
import type { Prisma, SponsorChannel } from '@prisma/client';
import type { Context } from 'telegraf';
import type { SceneContext, WizardContext } from 'telegraf/scenes';
import { DatabaseService } from '../database/database.service';
import { UsersService } from '../users';

@Injectable()
export class SponsorsService {
  constructor(
    private readonly database: DatabaseService,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: Prisma.SponsorChannelCreateInput): Promise<SponsorChannel> {
    return await this.database.sponsorChannel.create({
      data: {
        ...dto,
        expirationDate: new Date(dto.expirationDate).toISOString(),
      },
    });
  }
  async findAll(): Promise<SponsorChannel[] | null> {
    return await this.database.sponsorChannel.findMany({
      orderBy: { expirationDate: 'asc' },
      include: {
        subsUsers: {
          include: {
            _count: true,
          },
        },
      },
    });
  }

  async findStart(): Promise<SponsorChannel[] | null> {
    return await this.database.sponsorChannel.findMany({
      where: { type: 'start' },
      orderBy: { expirationDate: 'asc' },
      include: {
        subsUsers: {
          include: {
            _count: true,
          },
        },
      },
    });
  }

  async findTasks(): Promise<SponsorChannel[] | null> {
    return await this.database.sponsorChannel.findMany({
      where: { type: 'task' },
      orderBy: { expirationDate: 'asc' },
      include: {
        subsUsers: {
          include: {
            _count: true,
          },
        },
      },
    });
  }

  async findById(id: number): Promise<SponsorChannel | null> {
    if (!id) return null;

    const channel = await this.database.sponsorChannel.findUnique({
      where: { id },
      include: {
        subsUsers: {
          include: {
            _count: true,
          },
        },
      },
    });

    if (!channel) {
      return null;
    }

    return channel;
  }

  async findBySlug(slug: string): Promise<SponsorChannel | null> {
    if (!slug) return null;

    const channel = await this.database.sponsorChannel.findUnique({
      where: { channelSlug: slug },
      include: {
        subsUsers: {
          include: {
            _count: true,
          },
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
        NOT: {
          subsUsers: {
            some: {
              telegramId,
            },
          },
          // FIXME: add filter for active task
          // isActive: {
          //   equals: true,
          // },
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
  ) {
    try {
      const member = await ctx.telegram.getChatMember(
        `@${channelSlug}`,
        ctx.from.id,
      );

      if (
        member.status != 'member' &&
        member.status != 'administrator' &&
        member.status != 'creator'
      ) {
        return false;
      }

      this.updateBySlug(channelSlug, {
        subsUsers: {
          connect: {
            telegramId: ctx.from.id.toString(),
          },
        },
      });

      return true;
    } catch (error) {
      throw new Error('Ошибка в sponsors.service.ts:checkUserSubscription');
    }
  }

  async addRewardToUser(dto: { userId: string; channel: SponsorChannel }) {
    const updatedUser = await this.usersService.addRewardToUserFromSubscription(
      dto.userId,
      dto.channel,
    );

    return updatedUser;
  }

  async updateById(
    id: number,
    dto: Prisma.SponsorChannelUpdateInput,
  ): Promise<SponsorChannel> {
    return await this.database.sponsorChannel.update({
      where: { id },
      data: {
        ...dto,
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
    });
  }

  async removeById(id: number): Promise<SponsorChannel> {
    return await this.database.sponsorChannel.delete({
      where: { id },
    });
  }
}
