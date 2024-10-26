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
  constructor(
    private readonly sponsorsService: SponsorsService,
    // @Inject(forwardRef(() => BotService))
    // private readonly botService: BotService,
  ) {}

  @Post()
  create(@Body() dto: Prisma.SponsorChannelCreateInput) {
    return this.sponsorsService.create(dto);
  }

  // @Post('mailing')
  // mailing(@Body() dto: ICustomMessage) {
  //   return this.botService.sendMessageAllUsers(dto);
  // }

  @Get()
  findAll() {
    return this.sponsorsService.findAll();
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
