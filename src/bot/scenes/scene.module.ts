import { SponsorsModule } from '@/crud';
import { UsersModule } from '@/crud/users/users.module';
import { Module } from '@nestjs/common';
import { CreateChannelScene, DeleteChannelScene } from './channel';

@Module({
  imports: [UsersModule, SponsorsModule],
  controllers: [],
  providers: [CreateChannelScene, DeleteChannelScene],
  exports: [CreateChannelScene, DeleteChannelScene],
})
export class SceneModule {}
