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
import { UsersFindService } from './users-find.service';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersFindService: UsersFindService,
  ) {}

  @Post()
  create(@Body() dto: Prisma.UserCreateInput) {
    return this.usersService.create(dto);
  }

  @Post('set-null-balance/:telegramId')
  setNullBalance(@Param('telegramId') telegramId: string) {
    return this.usersService.setNullBalanceByTelegramId(telegramId);
  }

  @Get('stats')
  getStats() {
    return this.usersFindService.getStats();
  }

  @Get('active')
  findAllActiveUsers() {
    return this.usersFindService.findAllActiveUsers();
  }

  @Get('blocked-the-bot')
  findAllUsersBlockedTheBot() {
    return this.usersFindService.findAllUsersBlockedTheBot();
  }

  @Get()
  findAll() {
    return this.usersFindService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersFindService.findById(+id);
  }

  @Get('telegram-id/:telegramId')
  findByTelegramId(@Param('telegramId') telegramId: string) {
    return this.usersFindService.findByTelegramIdWithReferral(telegramId);
  }

  @Patch(':id')
  updateById(@Param('id') id: string, @Body() dto: Prisma.UserUpdateInput) {
    return this.usersService.updateById(+id, dto);
  }

  @Delete(':id')
  removeById(@Param('id') id: string) {
    return this.usersService.removeById(+id);
  }
}
