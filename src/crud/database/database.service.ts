import { SystemLoggerService } from '@/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  constructor(private readonly systemLogger: SystemLoggerService) {
    super();
    this.systemLogger.setContext(DatabaseService.name);
  }

  async onModuleInit() {
    await this.$connect()
      .then(() => {
        this.systemLogger.log(`Database successfully connected`);
      })
      .catch((err) => {
        this.systemLogger.error(`Database connection error`);
        this.systemLogger.error(err);
      });
  }
}
