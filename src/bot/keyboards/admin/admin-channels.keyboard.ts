import type { HistoryPaginationType } from '@/lib/types';
import { emojis } from '@/lib/utils';
import { SponsorChannel } from '@prisma/client';
import { Markup } from 'telegraf';
import { paginationKeyboard } from './pagination.keyboard';

const PATH = 'admin-channels';

export const adminChannelsKeyboard = (
  pagination: HistoryPaginationType<
    SponsorChannel & { _count: { subsUsers: number } }
  >,
  currency: string,
) => {
  const result = pagination.pageItems.map((channel) => {
    return [
      Markup.button.callback(
        getChannelPreviewString(channel, currency),
        `current-channel|${channel.id}`,
      ),
    ];
  });

  const backButtons = [
    [
      Markup.button.callback(`‹ Назад`, 'admin'),
      Markup.button.callback(`${emojis.folder} Добавить`, 'create-channel'),
    ],
  ];

  return [...result, [...paginationKeyboard(pagination, PATH)], ...backButtons];
};

const getChannelPreviewString = (
  channel: SponsorChannel & { _count: { subsUsers: number } },
  currency: string,
): string => {
  return `${emojis[channel.type]} • ${channel.isActive ? emojis.available : emojis.unavailable} ${channel.channelName} • ${emojis.bagOfMoney} ${channel.reward} ${currency} • ${emojis.peoples} ${channel._count.subsUsers} `;
};
