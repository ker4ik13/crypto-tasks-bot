import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users';
import { MiningService } from './mining.service';

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [MiningService],
  exports: [MiningService],
})
export class MiningModule {}
