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
import { SponsorsService } from './sponsors.service';

@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  @Post()
  create(@Body() dto: Prisma.SponsorChannelCreateInput) {
    return this.sponsorsService.create(dto);
  }

  @Get()
  findAll() {
    return this.sponsorsService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.sponsorsService.getStats();
  }

  @Get('tasks')
  findTasks() {
    return this.sponsorsService.findTasks();
  }
  @Get('start')
  findStart() {
    return this.sponsorsService.findStart();
  }

  @Get('byId/:id')
  findById(@Param('id') id: string) {
    return this.sponsorsService.findById(+id);
  }

  @Get('bySlug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.sponsorsService.findBySlug(slug);
  }

  @Patch('byId/:id')
  updateById(
    @Param('id') id: string,
    @Body() dto: Prisma.SponsorChannelUpdateInput,
  ) {
    const newDto = {
      ...dto,
    };
    if (dto.expirationDate) {
      newDto.expirationDate = new Date(
        dto.expirationDate.toString(),
      ).toISOString();
    }
    return this.sponsorsService.updateById(+id, newDto);
  }
  @Patch('bySlug/:slug')
  updateBySlug(
    @Param('slug') slug: string,
    @Body() dto: Prisma.SponsorChannelUpdateInput,
  ) {
    const newDto = {
      ...dto,
    };
    if (dto.expirationDate) {
      newDto.expirationDate = new Date(
        dto.expirationDate.toString(),
      ).toISOString();
    }
    return this.sponsorsService.updateBySlug(slug, newDto);
  }

  @Delete('bySlug/:slug')
  removeBySlug(@Param('slug') slug: string) {
    return this.sponsorsService.removeBySlug(slug);
  }
}
