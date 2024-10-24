import type { User } from '@prisma/client';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';

export class CreateReferralDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsObject()
  owner: User;

  ownerId: number;

  @IsArray()
  invitedUsers: User[];
}
