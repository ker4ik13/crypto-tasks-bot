import type { SponsorChannelType } from '@prisma/client';

export interface ISponsorChannelsParams {
  type?: SponsorChannelType;
  isActive?: boolean;
}
