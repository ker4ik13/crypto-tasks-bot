import { emojis } from '@/lib/utils';
import { Markup } from 'telegraf';

export const mainKeyboard = () => {
  return [
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
};
