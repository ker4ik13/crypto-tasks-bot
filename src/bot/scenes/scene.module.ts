import { SponsorsModule } from '@/crud';
import { UsersModule } from '@/crud/users/users.module';
import { Module } from '@nestjs/common';
import { CreateChannelScene } from './channel';

@Module({
  imports: [UsersModule, SponsorsModule],
  controllers: [],
  providers: [CreateChannelScene],
  exports: [CreateChannelScene],
})
export class SceneModule {}
