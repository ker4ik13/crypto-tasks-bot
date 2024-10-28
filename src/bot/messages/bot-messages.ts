import {
  DEFAULT_ADMIN_USERNAME,
  DEFAULT_CURRENCY,
  DEFAULT_MIN_WITHDRAWAL_AMOUNT,
  DEFAULT_REWARD_FOR_A_FRIEND,
  DEFAULT_TELEGRAM_BOT_USERNAME,
} from '@/lib/common';
import { beautyCurrency, getNormalChannelLink } from '@/lib/helpers';
import { UserWithReferral } from '@/lib/types';
import { emojis } from '@/lib/utils';
import { SponsorChannel, User } from '@prisma/client';

export const BotMessages = {
  welcome: (currency = DEFAULT_CURRENCY) =>
    `Приветствую, это проект где вы можете зарабатывать ${currency}. Есть два способа заработка: получать ${currency} с помощью рефералов или инвестировать свои ${currency} 🪙`,
  pleaseAuth: `${emojis.key} Для авторизации в нашем боте нужно вступить во все наши каналы:`,
  authDone: `${emojis.checkmark} Вы успешно подписались`,
  cabinet: (user: User, currency = DEFAULT_CURRENCY) => {
    return `📱 <b>Ваш Кабинет:</b>\n\n<b>👤 Имя:</b> ${user.firstName}\n<b>${emojis.key} Ваш ID:</b> <code>${user.telegramId}</code>\n\n<b>${emojis.card} Баланс:</b>\n● <b>Основной:</b> <code>${beautyCurrency(user.currentBalance)}</code> ${currency}\n● <b>Выведено:</b> <code>${beautyCurrency(user.outputBalance)}</code> ${currency}`;
  },
  partners: (
    user: UserWithReferral,
    refCode: string,
    currency = DEFAULT_CURRENCY,
    reward = DEFAULT_REWARD_FOR_A_FRIEND,
    botUsername = DEFAULT_TELEGRAM_BOT_USERNAME,
  ) => {
    return `${emojis.diamond} Приглашай друзей и получай ${reward} ${currency} за каждого друга\n\n${emojis.peoples} Всего пригласил: ${user.referral.invitedUsers.length} человек\n\n${emojis.link} Ссылка для приглашения: https://t.me/${botUsername}?start=${refCode}`;
  },
  withdraw: (
    minWithdrawalAmount = DEFAULT_MIN_WITHDRAWAL_AMOUNT,
    currency = DEFAULT_CURRENCY,
    adminUsername = DEFAULT_ADMIN_USERNAME,
  ) =>
    `Для вывода средств пишите @${adminUsername} и присылайте свой ID в боте. <b>Минимальный вывод от ${beautyCurrency(minWithdrawalAmount)} ${currency}</b>\n\n Узнать его можно: <b>Главная</b> – <b>Кабинет</b> – <b>${emojis.key} Ваш ID</b>`,
  information: (
    numbersOfUsers: number,
    totalWithdrawal: number,
    currency = DEFAULT_CURRENCY,
  ) =>
    `<b>📊 Информация о проекте:</b>\n\n${emojis.peoples} Пользователей в боте: ${numbersOfUsers}\n${emojis.flyMoney} Выплачено: ${beautyCurrency(totalWithdrawal)} ${currency}`,
  topRefs: (users: UserWithReferral[]) => {
    if (!users || users.length === 0) {
      return `${emojis.warning} Статистика пока пустая. <b>Делитесь ботом</b> с друзьями и приходите позже!`;
    }
    return `${emojis.cup} Топ рефоводов:\n\n${users
      .map((user, index) => {
        return `<b>${index + 1}.</b> <a href='https://t.me/${user.username}'>${user.firstName} ${user.lastName ? user.lastName : ''}</a> – ${user.referral.invitedUsers.length} рефералов`;
      })
      .join('\n')}`;
  },
  newTask: (channel: SponsorChannel, currency = DEFAULT_CURRENCY) => {
    return `${emojis.passport} <b>ID задания:</b> ${channel.id}\n${emojis.bagOfMoney} <b>Вознаграждение:</b> ${beautyCurrency(channel.reward)} ${currency}\n\n${emojis.search} Подпишитесь на канал <b>${getNormalChannelLink(channel)}</b> для выполнения задания.`;
  },
  taskReward: (channel: SponsorChannel, currency = DEFAULT_CURRENCY) => {
    return `Вам начислено ${beautyCurrency(channel.reward)} ${currency} за выполнение задания.`;
  },
  noTasks: `${emojis.warning} Заданий больше нет. <b>Делитесь ботом</b> с друзьями и приходите позже!`,
  setNullBalance: (
    user: User,
    maxWarningCount: number,
    currency = DEFAULT_CURRENCY,
    admin = DEFAULT_ADMIN_USERNAME,
  ) =>
    `${emojis.warning} <b>Ваш баланс был сброшен до 0 ${currency} за нарушение правил.</b>\n${emojis.user} Количество предупреждений: ${user.warningsCount}\n\nПри ${maxWarningCount}/${maxWarningCount} предупреждений вы будете заблокированы ${emojis.blick}\n<b>Подробнее:</b> @${admin}`,
  maxWarnings: (
    user: User,
    maxWarningCount: number,
    admin = DEFAULT_ADMIN_USERNAME,
  ) =>
    `<b>${emojis.warning} Вы достигли лимита предупреждений: ${user.warningsCount}/${maxWarningCount}</b>\n\n${emojis.blick} Доступ к боту ограничен.\n\n<b>Подробнее:</b> @${admin}`,
};
