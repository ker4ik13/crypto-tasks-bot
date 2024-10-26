import { applyDecorators, UseGuards } from '@nestjs/common';
import { CheckSubscriptionGuard } from '../guards';

export function CheckSubscription() {
  return applyDecorators(UseGuards(CheckSubscriptionGuard));
}
