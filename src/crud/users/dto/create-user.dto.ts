import type { Payment, Referral } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  lastName?: string;

  @IsString()
  username?: string;

  @IsString()
  languageCode?: string;

  @IsBoolean()
  isAdmin?: boolean;

  @IsNumber()
  currentBalance: number;

  @IsNumber()
  outputBalance: number;

  payments?: Payment[];

  @IsDate()
  createdDate: Date;

  invitedBy?: Referral;

  invitedById?: number;

  referral?: Referral;
}
