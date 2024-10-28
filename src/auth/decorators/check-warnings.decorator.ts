import { applyDecorators, UseGuards } from '@nestjs/common';
import { CheckWarningsGuard } from '../guards';

export function CheckWarnings() {
  return applyDecorators(UseGuards(CheckWarningsGuard));
}
