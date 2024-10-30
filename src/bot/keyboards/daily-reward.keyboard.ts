import { emojis } from '@/lib/utils';
import { Markup } from 'telegraf';

export const dailyRewardKeyboard = () => {
  return [
    [
      Markup.button.callback(`${emojis.building} Главное меню`, 'main-menu'),
      Markup.button.callback(`${emojis.user} Кабинет`, 'cabinet'),
    ],
  ];
};

export const dailyRewardReminderKeyboard = () => {
  return [
    [
      Markup.button.callback(
        `${emojis.bagOfMoney} Забрать бонус`,
        'daily-reward',
      ),
    ],
  ];
};
