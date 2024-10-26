import { emojis } from '@/lib/utils';
import { SponsorChannel } from '@prisma/client';
import { Markup } from 'telegraf';

export const newTaskKeyboard = (channel: SponsorChannel) => {
  return [
    [Markup.button.url(`${emojis.diamond} Подписаться`, channel.channelLink)],
    [
      Markup.button.callback(`${emojis.back} Назад`, 'main-menu'),
      Markup.button.callback(
        `${emojis.checkmark} Проверить`,
        `tasks-check|${channel.channelSlug}`,
      ),
    ],
  ];
};

export const nextTaskKeyboard = () => {
  return [
    [
      Markup.button.callback(`${emojis.back} Назад`, `main-menu`),
      Markup.button.callback(`${emojis.flyMoney} Следующее задание`, `tasks`),
    ],
  ];
};
