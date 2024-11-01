import { emojis } from '@/lib/utils';
import { Markup } from 'telegraf';

export const adminMenuKeyboard = () => {
  return [
    [
      Markup.button.callback(`${emojis.peoples} Пользователи`, 'admin|users|1'),
      Markup.button.callback(`${emojis.flyMoney} Спонсоры`, 'admin-channels|1'),
    ],
    [
      Markup.button.callback(
        `${emojis.peoples} Рассылки ${emojis.cross}`,
        'admin|mailing',
      ),
    ],
    [Markup.button.callback(`‹ Назад`, 'main-menu')],
  ];
};
