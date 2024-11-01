import { emojis } from '@/lib/utils';
import { User } from '@prisma/client';
import { Markup } from 'telegraf';

export const adminUserKeyboard = (user: User, fromPage = 1) => {
  const result = [
    [
      Markup.button.callback(
        `${emojis.warning} Обнулить баланс ${emojis.cross}`,
        `warning|user|${user.telegramId}`,
      ),
    ],
    [
      Markup.button.callback(
        `${emojis.message} Отправить сообщение ${emojis.cross}`,
        `message|user|${user.telegramId}`,
      ),
    ],
    [
      Markup.button.callback(
        `${emojis.flyMoney} Вывести с баланса ${emojis.cross}`,
        `withdraw|user|${user.telegramId}`,
      ),
    ],
    [Markup.button.callback(`‹ Назад`, `admin|users|${fromPage}`)],
  ];

  return [...result];
};
