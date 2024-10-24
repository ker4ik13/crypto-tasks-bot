import { ConflictException, Injectable } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { ReferralsService } from '../referrals';

@Injectable()
export class UsersService {
  constructor(
    private readonly database: DatabaseService,
    private readonly referralsService: ReferralsService,
  ) {}

  async create(dto: Prisma.UserCreateInput): Promise<User> {
    const isUserInclude = await this.database.user.findUnique({
      where: { id: dto.id },
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
      code: this.referralsService.createOneCode(),
      owner: {
        connect: {
          id: newUser.id,
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
    });

    if (!user) {
      return null;
    }

    return user;
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
      where: { isAdmin: true },
    });
  }
}
