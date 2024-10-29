import { DEFAULT_CURRENCY } from '@/lib/common';
import { emojis } from '@/lib/utils';
import { Mining } from '@prisma/client';

export const BotMiningMessages = {
  miningStats: (
    userMining: Mining,
    miningSize: number,
    currency = DEFAULT_CURRENCY,
  ) => {
    return `${emojis.diamond} <b>Кабинет майнинга</b> ${emojis.diamond}\n${userMining.isEnabled ? emojis.checkmark : emojis.cross} Майнинг ${userMining.isEnabled ? 'запущен' : 'не запущен'}\n\n${emojis.lightning} Скорость: <b>${miningSize} ${currency}/сек</b>\n${emojis.pick} Намайнено: <b>${userMining.currentBalance} ${currency}</b>\n${emojis.bagOfMoney} Собрано: <b>${userMining.collectedBalance} ${currency}</b>`;
  },
  miningNotStart: (miningSize: number, currency = DEFAULT_CURRENCY) => {
    return `${emojis.pick} <b>Кабинет майнинга</b>\n${emojis.cross} Майнинг не запущен\n\n${emojis.lightning} Скорость: <b>${miningSize} ${currency}/сек</b>`;
  },
};
