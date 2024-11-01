import { applyDecorators, UseGuards } from '@nestjs/common';
import { CheckAdminGuard } from '../guards';

export function CheckAdmin() {
  return applyDecorators(UseGuards(CheckAdminGuard));
}
