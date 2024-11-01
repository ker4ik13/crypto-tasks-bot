import { strongBeautyCurrency } from '@/lib/helpers';
import type { HistoryPaginationType, UserWithReferral } from '@/lib/types';
import { emojis } from '@/lib/utils';
import { Markup } from 'telegraf';
import { paginationKeyboard } from './pagination.keyboard';

const PATH = 'admin|users';

export const adminUsersKeyboard = (
  pagination: HistoryPaginationType<UserWithReferral>,
  currency: string,
) => {
  const result = pagination.pageItems.map((user) => {
    return [
      Markup.button.callback(
        getUserPreviewString(user, currency),
        `current-user|${user.telegramId}`,
      ),
    ];
  });

  const backButtons = [
    [
      Markup.button.callback(`‹ Назад`, 'admin'),
      Markup.button.callback(`${emojis.stat} Статистика`, 'users-stats'),
    ],
  ];

  return [...result, [...paginationKeyboard(pagination, PATH)], ...backButtons];
};

const getUserPreviewString = (
  user: UserWithReferral,
  currency: string,
): string => {
  const result = `${user.isBlockedTheBot ? emojis.unavailable : emojis.available} ${user.username ? user.username.slice(0, 10).replace(/[^\x20-\x7E]+/g, '') : user.firstName.slice(0, 10).replace(/[^\x20-\x7E]+/g, '')} • ${emojis.bagOfMoney} ${strongBeautyCurrency(user.currentBalance)} ${currency} • ${emojis.peoples} ${user.referral && user.referral.invitedUsers && user.referral.invitedUsers.length > 0 ? user.referral.invitedUsers.length : 0}${user.warningsCount > 0 ? ` • ${emojis.warning} ${user.warningsCount}` : ''}`;
  return result;
};
