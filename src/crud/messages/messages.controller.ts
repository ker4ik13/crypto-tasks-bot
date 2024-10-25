import { ICustomMessage } from '@/lib/types';
import { Body, Controller, Param, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('mailing')
  sendMessageAllUsers(@Body() dto: ICustomMessage) {
    return this.messagesService.sendMessageAllUsers(dto);
  }
  @Post(':id')
  sendMessageUserByChatId(
    @Param('id') chatId: string,
    @Body() dto: ICustomMessage,
  ) {
    return this.messagesService.sendMessageByChatId(+chatId, dto.message);
  }
}
