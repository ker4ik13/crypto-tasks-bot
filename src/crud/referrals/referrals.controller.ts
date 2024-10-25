import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ReferralsService } from './referrals.service';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  create(@Body() dto: Prisma.ReferralCreateInput) {
    return this.referralsService.create(dto);
  }

  @Post('add')
  addUserToReferral(@Body() dto: { code: string; userId: number }) {
    return this.referralsService.addUserToReferral(dto);
  }

  @Get()
  findAll() {
    return this.referralsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.referralsService.findById(+id);
  }

  @Patch(':id')
  updateById(@Param('id') id: string, @Body() dto: Prisma.ReferralUpdateInput) {
    return this.referralsService.updateById(+id, dto);
  }

  @Delete(':id')
  removeById(@Param('id') id: string) {
    return this.referralsService.removeById(+id);
  }
}
