import { emojis } from '@/lib/utils';
import type { User } from '@prisma/client';
import { Markup } from 'telegraf';

export const mainKeyboard = (user?: User) => {
  const resultKeyboard = [
    [
      Markup.button.callback(`${emojis.pick} Майнинг`, 'mining'),
      Markup.button.callback(`${emojis.bagOfMoney} Задания`, 'tasks'),
    ],
    [
      Markup.button.callback(`${emojis.peoples} Партнеры`, 'partners'),
      Markup.button.callback(`${emojis.user} Кабинет`, 'cabinet'),
    ],
    [
      Markup.button.callback(`${emojis.gift} Ежедневный бонус`, 'daily-reward'),
      Markup.button.callback(`${emojis.pin} Информация`, 'information'),
    ],
  ];

  if (user && user.isAdmin) {
    resultKeyboard.push([
      Markup.button.callback(`${emojis.unlock} Админка`, 'admin'),
    ]);
  }
  return resultKeyboard;
};
