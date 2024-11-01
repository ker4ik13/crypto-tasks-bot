import { emojis } from '@/lib/utils';
import { Markup } from 'telegraf';

export const createChannelSkipKeyboard = (nextStep?: number) => {
  const result = [[]];

  if (nextStep) {
    result[0].push(
      Markup.button.callback(`Пропустить ›`, `create-channel-step|${nextStep}`),
    );
  }

  result.push([
    Markup.button.callback(`${emojis.cross} Отменить создание`, `cancel`),
  ]);

  return [...result];
};
