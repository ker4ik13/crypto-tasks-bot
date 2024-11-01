import { Prisma } from '@prisma/client';

export type UserWithReferral = Prisma.UserGetPayload<{
  include: {
    referral: {
      include: {
        invitedUsers: true;
      };
    };
  };
}>;
export type UserAll = Prisma.UserGetPayload<{
  include: {
    referral: {
      include: {
        invitedUsers: true;
      };
    };
    mining: true;
    invitedBy: true;
    payments: true;
    sponsorChannels: true;
  };
}>;
