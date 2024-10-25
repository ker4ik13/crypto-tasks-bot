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

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.sponsorsService.findById(+id);
  }

  @Patch(':id')
  updateById(
    @Param('id') id: string,
    @Body() dto: Prisma.SponsorChannelUpdateInput,
  ) {
    return this.sponsorsService.updateById(+id, dto);
  }

  @Delete(':id')
  removeById(@Param('id') id: string) {
    return this.sponsorsService.removeById(+id);
  }
}
