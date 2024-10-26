import { SponsorChannel } from '@prisma/client';

export const getNormalChatId = (chatId: string) => {
  if (chatId[0] === '-' || chatId[0] === '+') {
    return chatId;
  }

  if (chatId.startsWith('https://')) {
    return chatId;
  }

  return `@${chatId}`;
};

export const getNormalChannelLink = (channel: SponsorChannel) => {
  if (channel.channelSlug[0] === '-' || channel.channelSlug[0] === '+') {
    return channel.channelLink;
  }

  return `<a href="${channel.channelLink}">${channel.channelName}</a>`;
};
