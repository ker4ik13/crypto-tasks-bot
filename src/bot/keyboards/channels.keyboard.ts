import { emojis } from '@/lib/utils';
import type { SponsorChannel } from '@prisma/client';
import { Markup } from 'telegraf';

export const channelsKeyboard = (channels: SponsorChannel[]) => {
  const resultChannels = channels.map((channel) => {
    return [Markup.button.url(channel.channelName, channel.channelLink)];
  });

  return [
    ...resultChannels,
    [
      Markup.button.callback(
        `${emojis.checkmark} Проверить подписки`,
        'check-channels-subs',
      ),
    ],
  ];
};
