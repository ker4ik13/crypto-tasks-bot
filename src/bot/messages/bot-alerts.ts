import { DEFAULT_CURRENCY, MIN_WITHDRAWAL_AMOUNT } from '@/lib/common';
import { beautyCurrency } from '@/lib/helpers';
import { emojis } from '@/lib/utils';

export const BotAlerts = {
  minWithdrawal: (
    minWithdrawalAmount = MIN_WITHDRAWAL_AMOUNT,
    currency = DEFAULT_CURRENCY,
  ) => {
    return `${emojis.warning} Минимальная сумма вывода:\n${beautyCurrency(minWithdrawalAmount)} ${currency}`;
  },
  notSubscribed: `${emojis.warning} Чтобы выполнить задание, необходимо подписаться на канал!`,
  error: `${emojis.cross} Произошла ошибка, попробуйте еще раз позже!`,
};
