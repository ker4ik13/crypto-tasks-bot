import { emojis } from '@/lib/utils';
import { Markup } from 'telegraf';

export const cabinetKeyboard = () => {
  return [
    [
      Markup.button.callback(`${emojis.withdraw} Вывести`, 'withdraw'),
      Markup.button.callback(`${emojis.building} Главное меню`, 'main-menu'),
    ],
  ];
};
