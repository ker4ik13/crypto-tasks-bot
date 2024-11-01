import { getLabelFromChannelType } from '@/lib/helpers';
import { emojis } from '@/lib/utils';
import { SponsorChannel } from '@prisma/client';
import { Markup } from 'telegraf';

export const adminChannelKeyboard = (channel: SponsorChannel, fromPage = 1) => {
  const result = [
    [
      Markup.button.callback(
        `${channel.isActive ? emojis.available : emojis.unavailable} ${channel.isActive ? 'Активен' : 'Не активен'} ${emojis.toggle}`,
        `toggle-active-channel|${channel.id}`,
      ),
    ],
    [
      Markup.button.callback(
        `${channel.type === 'start' ? emojis.available : ''} ${getLabelFromChannelType('start')}`,
        `toggle-channel-type|${channel.id}|start`,
      ),
      Markup.button.callback(
        `${channel.type === 'task' ? emojis.available : ''} ${getLabelFromChannelType('task')}`,
        `toggle-channel-type|${channel.id}|task`,
      ),
      Markup.button.callback(
        `${channel.type === 'all' ? emojis.available : ''} ${getLabelFromChannelType('all')}`,
        `toggle-channel-type|${channel.id}|all`,
      ),
    ],
    [
      Markup.button.callback(
        `${emojis.calendar} Изменить дату истекания ${emojis.cross}`,
        `toggle-expiration-channel|${channel.id}`,
      ),
    ],
    [
      Markup.button.callback(
        `${emojis.key} Проверить`,
        `check-channel|${channel.id}`,
      ),
    ],
    [Markup.button.callback(`${emojis.cross} Удалить канал`, `delete-channel`)],
    [Markup.button.callback(`‹ Назад`, `admin-channels|${fromPage}`)],
  ];

  return [...result];
};
