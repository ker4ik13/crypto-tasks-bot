import { emojis } from '@/lib/utils';
import { Markup } from 'telegraf';

export interface IContact {
  name: string;
  link: string;
}

export const informationKeyboard = (contacts: IContact[]) => {
  const resultContacts = contacts.map((contact) => {
    return [Markup.button.url(contact.name, contact.link)];
  });

  return [
    ...resultContacts,
    [
      Markup.button.callback(`${emojis.back} Назад`, 'main-menu'),
      Markup.button.callback(`${emojis.cup} Топ рефоводов`, 'top-ref-users'),
    ],
  ];
};
