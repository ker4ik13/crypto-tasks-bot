import { DEFAULT_CURRENCY } from '@/lib/common';
import {
  beautyCurrency,
  getBeautyMessage,
  getLabelFromChannelType,
  getNormalChannelLink,
} from '@/lib/helpers';
import type { IAdminMessage, LabelValue, UserAll } from '@/lib/types';
import { emojis } from '@/lib/utils';
import type { SponsorChannel, User } from '@prisma/client';

export const BotAdminMessages = {
  menu: (user: User) => {
    return `${user.firstName}, добро пожаловать в админ панель бота. Вы можете управлять ботом, рассылать сообщения и отслеживать статистику`;
  },
  users: `${emojis.user} <b>Список всех пользователей:</b>\n\n${emojis.info} Чтобы выполнить поиск по странице, отправьте боту:\n<code>admin|users|10</code>\nгде 10 – это страница поиска`,
  channels: `${emojis.peoples} <b>Список всех каналов спонсоров:</b>\n\n${emojis.info} Чтобы выполнить поиск по странице, отправьте боту:\n<code>admin-channels|10</code>\nгде 10 – это страница поиска\n\n${emojis.info} <b>Обозначения:</b> ${emojis.start} – Старт, ${emojis.task} – Задание, ${emojis.all} – Везде`,
  user: (user: UserAll, currency: string) => {
    const result = [
      `${emojis.user} ${user.firstName} ${user.lastName ? user.lastName : ''} ${user.username ? `(@${user.username})` : ''}`,
      `<b>ID:</b> <code>${user.telegramId}</code>\n`,
      `${user.isBlockedTheBot ? emojis.unavailable : emojis.available} ${user.isBlockedTheBot ? 'Заблокировал бота' : 'Доступен к рассылке'}`,
      `${emojis.warning}<b>Предупреждений:</b> ${user.warningsCount ? user.warningsCount : 0}\n`,
      `${emojis.bagOfMoney} <b>Баланс:</b>`,
      `<b>● Основной:</b> ${beautyCurrency(user.currentBalance)} ${currency}`,
      `<b>● Выведено:</b> ${beautyCurrency(user.outputBalance)} ${currency}\n`,
      `${emojis.peoples} <b>Рефералов:</b> ${user.referral && user.referral.invitedUsers.length ? user.referral.invitedUsers.length : 0}`,
    ];

    if (user.mining && user.mining.isEnabled) {
      result.push(
        `<b>${emojis.pick} Намайнено:</b> ${beautyCurrency(user.mining.currentBalance)} ${currency}`,
      );
      result.push(
        `<b>${emojis.pick} Собрано:</b> ${beautyCurrency(user.mining.collectedBalance)} ${currency}`,
      );
      result.push(
        `<b>${emojis.pick} ${emojis.calendar} Дата обновления:</b> ${new Date(
          user.mining.dateOfLastReceipt,
        ).toLocaleString('ru')}`,
      );
    }

    return result.join('\n');
  },
  channel: (
    channel: SponsorChannel & { subsUsers: User[] },
    currency: string,
  ) => {
    const result = [
      `${emojis.passport} ${channel.channelName}`,
      `${emojis.link} ${getNormalChannelLink(channel)}\n`,
      `${emojis.search} <b>Тип канала:</b> ${getLabelFromChannelType(channel.type)}`,
      `${emojis.bagOfMoney} <b>Вознаграждение:</b> ${beautyCurrency(channel.reward)} ${currency}`,
      `${channel.isActive ? emojis.available : emojis.unavailable} <b>Статус:</b> ${channel.isActive ? 'Активен' : 'Не активен'}`,
      `${emojis.peoples} Подписчиков пришло: ${channel.subsUsers.length}\n`,
      `${emojis.calendar} Дата создания: ${new Date(channel.createdDate).toLocaleString('ru')}`,
      `${emojis.calendar} Срок истекает: ${new Date(channel.expirationDate).toLocaleString('ru')}`,
    ];

    return result.join('\n');
  },
  mailingStatistics: (
    stats: LabelValue[],
    title = `${emojis.message} Результаты рассылки по всем пользователям`,
  ) => {
    return {
      title,
      text: stats.map((stat) => getBeautyMessage(stat)).join(''),
    };
  },
  mailingError: (error: string): IAdminMessage => {
    return {
      title: `${emojis.message}${emojis.cross} Ошибка при рассылке!`,
      text: error,
    };
  },
  mailingDontSendBecauseBlocked: (user: User) =>
    `Пользователь ${user.telegramId} ${user.username ? `(@${user.username})` : ''} не получил сообщения из за блокировки бота`,
  noMoney: (
    user: User,
    amount: number,
    currency = DEFAULT_CURRENCY,
  ): IAdminMessage => {
    return {
      title: `${emojis.cross} Недостаточно средств для вывода у пользователя @${user.username}!`,
      text: `${getBeautyMessage({
        label: 'Баланс пользователя:',
        value: `${beautyCurrency(user.currentBalance)} ${currency}`,
      })}${getBeautyMessage({
        label: 'Попытка вывести:',
        value: `${amount} ${currency}`,
      })}${getBeautyMessage({
        label: 'Уже выведено:',
        value: `${beautyCurrency(user.outputBalance)} ${currency}`,
      })}`,
    };
  },
  successfulPayment: (
    user: User,
    amount: number,
    currency = DEFAULT_CURRENCY,
  ): IAdminMessage => {
    return {
      title: `${emojis.bagOfMoney} Выплата средств у пользователя @${user.username} успешна!`,
      text: `Пользователь успешно получил выплату в размере ${amount} ${currency}\n\n${getBeautyMessage(
        {
          label: 'Баланс пользователя:',
          value: `${beautyCurrency(user.currentBalance)} ${currency}`,
        },
      )}${getBeautyMessage({
        label: 'Выведено:',
        value: `${beautyCurrency(user.outputBalance)} ${currency}`,
      })}`,
    };
  },
  paymentError: (telegramId: string, error?: string) =>
    `Ошибка при выводе средств у пользователя ${telegramId}\n\n${error}`,
  setNullBalanceError: (telegramId: string, error?: string) =>
    `${emojis.cross} Произошла ошибка при обнулении баланса пользователя ${telegramId}\n${emojis.warning} Баланс не был сброшен\n\n${error}`,
  setNullBalanceNotFoundUser: (telegramId: string): IAdminMessage => {
    return {
      title: `${emojis.cross} Пользователь ${telegramId} не найден. Баланс не был сброшен!`,
      text: `Пользователь ${telegramId} не найден. Баланс не был сброшен!`,
    };
  },
};
