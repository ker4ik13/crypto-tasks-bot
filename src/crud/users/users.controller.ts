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
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: Prisma.UserCreateInput) {
    return this.usersService.create(dto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(+id);
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
