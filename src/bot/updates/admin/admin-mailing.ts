import { SponsorsService } from '@/crud';
import { UsersAdminService } from '@/crud/users/users-admin.service';
import { UsersFindService } from '@/crud/users/users-find.service';
import { ConfigService } from '@nestjs/config';
import { Update } from 'nestjs-telegraf';

@Update()
export class AdminMailingUpdate {
  constructor(
    private readonly usersFindService: UsersFindService,
    private readonly usersAdminService: UsersAdminService,
    private readonly configService: ConfigService,
    private readonly sponsorsService: SponsorsService,
  ) {}
}
