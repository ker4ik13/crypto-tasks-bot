import { Body, Controller, Param, Patch } from '@nestjs/common';
import { WithdrawDto } from './dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Patch(':id')
  updateById(@Param('id') id: string, @Body() dto: WithdrawDto) {
    return this.walletService.withdrawByTelegramId(id, dto.amount);
  }
}
