import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
