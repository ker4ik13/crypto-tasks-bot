import { Injectable } from '@nestjs/common';
import type { Prisma, Referral } from '@prisma/client';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ReferralsService {
  constructor(private readonly database: DatabaseService) {}

  async create(dto: Prisma.ReferralCreateInput): Promise<Referral> {
    return await this.database.referral.create({
      data: dto,
      include: {
        invitedUsers: true,
        owner: true,
      },
    });
  }

  createOneCode() {
    return randomUUID();
  }

  async addUserToReferral(dto: {
    code: string;
    userId: number;
  }): Promise<Referral | null> {
    return await this.database.referral.update({
      where: { code: dto.code },
      data: {
        invitedUsers: {
          connect: {
            id: dto.userId,
          },
        },
      },
    });
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

  // async updateById(id: number, dto: UpdateUserDto): Promise<User> {
  //   return await this.database.user.update({
  //     where: { id },
  //     data: {
  //       ...dto,
  //     },
  //   });
  // }

  // async removeById(id: number): Promise<User> {
  //   return await this.database.user.delete({
  //     where: { id },
  //   });
  // }
}
