import { emojis } from '@/lib/utils';
import { Markup } from 'telegraf';

export const deleteChannelKeyboard = () => {
  const result = [
    [
      Markup.button.callback(
        `${emojis.checkmark} Удалить`,
        `delete-channel|yes`,
      ),
    ],
    [Markup.button.callback(`${emojis.cross} Не удалять`, `cancel`)],
  ];

  return [...result];
};
