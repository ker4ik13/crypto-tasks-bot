import { DEFAULT_CURRENCY } from '@/lib/common';
import { beautyCurrency, getBeautyMessage } from '@/lib/helpers';
import type { IAdminMessage, LabelValue } from '@/lib/types';
import { emojis } from '@/lib/utils';
import type { User } from '@prisma/client';

export const BotAdminMessages = {
  mailingStatistics: (stats: LabelValue[]) => {
    return {
      title: `${emojis.message} Результаты рассылки по всем пользователям`,
      text: stats.map((stat) => getBeautyMessage(stat)).join(''),
    };
  },
  mailingError: (error: string): IAdminMessage => {
    return {
      title: `${emojis.message}${emojis.cross} Ошибка при рассылке!`,
      text: error,
    };
  },
  mailingDontSendBeacuseBlocked: (user: User) =>
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
