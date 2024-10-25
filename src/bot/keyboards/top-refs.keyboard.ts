import { DEFAULT_TELEGRAM_BOT_USERNAME } from '@/lib/common';
import { emojis } from '@/lib/utils';
import { Markup } from 'telegraf';

export const topRefsKeyboard = (
  refCode: string,
  botUsername = DEFAULT_TELEGRAM_BOT_USERNAME,
) => {
  const url = `https://t.me/share/url?url=https://t.me/${botUsername}?start=${refCode}`;
  return [
    [
      Markup.button.callback(`${emojis.back} Назад`, 'information'),
      Markup.button.url(`${emojis.diamond} Поделиться`, url),
    ],
    [Markup.button.callback(`${emojis.building} Главное меню`, 'main-menu')],
  ];
};
