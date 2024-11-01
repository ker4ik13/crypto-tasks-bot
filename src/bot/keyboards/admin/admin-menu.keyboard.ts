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
        `${emojis.message} Рассылки ${emojis.cross}`,
        'admin-mailing|1',
      ),
    ],
    [Markup.button.callback(`‹ Назад`, 'main-menu')],
  ];
};
