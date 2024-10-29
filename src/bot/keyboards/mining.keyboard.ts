import { DEFAULT_CURRENCY } from '@/lib/common';
import { emojis } from '@/lib/utils';
import { Markup } from 'telegraf';

export const miningKeyboard = (currency = DEFAULT_CURRENCY) => {
  return [
    [
      Markup.button.callback(
        `${emojis.bagOfMoney} Собрать ${currency}`,
        'mining|collect',
      ),
      Markup.button.callback(`${emojis.refresh} Обновить`, 'mining|refresh'),
    ],
    [Markup.button.callback(`${emojis.back} Назад`, 'main-menu')],
  ];
};

export const miningStartKeyboard = () => {
  return [
    [Markup.button.callback(`${emojis.pick} Запустить`, 'mining|start')],
    [Markup.button.callback(`${emojis.back} Назад`, 'main-menu')],
  ];
};
