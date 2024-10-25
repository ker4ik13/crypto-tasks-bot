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
