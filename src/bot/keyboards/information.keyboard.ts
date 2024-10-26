import { emojis } from '@/lib/utils';
import { Markup } from 'telegraf';

export interface IContact {
  name: string;
  link: string;
}

export const informationKeyboard = (
  contacts: IContact[],
  channelLink?: IContact,
  chatLink?: IContact,
) => {
  const firstRow = contacts.map((contact) => {
    return Markup.button.url(contact.name, contact.link);
  });

  const secondRow: any = [
    Markup.button.callback(`${emojis.cup} Топ рефоводов`, 'top-ref-users'),
  ];
  // Если есть канал
  if (channelLink && channelLink.link) {
    secondRow.push(Markup.button.url(channelLink.name, channelLink.link));
  }

  const thirdRow: any = [
    Markup.button.callback(`${emojis.back} Назад`, 'main-menu'),
  ];
  // Если есть чат
  if (chatLink && chatLink.link) {
    thirdRow.push(Markup.button.url(chatLink.name, chatLink.link));
  }

  return [[...firstRow], [...secondRow], [...thirdRow]];
};
