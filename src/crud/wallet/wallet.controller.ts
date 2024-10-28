import { Body, Controller, Param, Patch } from '@nestjs/common';
import { WithdrawDto } from './dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Patch(':telegramId')
  updateById(
    @Param('telegramId') telegramId: string,
    @Body() dto: WithdrawDto,
  ) {
    return this.walletService.withdrawByTelegramId(telegramId, dto.amount);
  }
}
