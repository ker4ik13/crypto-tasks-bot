import { emojis } from '@/lib/utils';
import { Markup } from 'telegraf';

export const withdrawKeyboard = () => {
  return [
    [Markup.button.callback(`${emojis.user} Кабинет`, 'cabinet')],
    [
      Markup.button.callback(`${emojis.back} Назад`, 'cabinet'),
      Markup.button.callback(`${emojis.building} Главное меню`, 'main-menu'),
    ],
  ];
};
