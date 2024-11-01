import { Markup } from 'telegraf';

export const adminUsersStatsKeyboard = () => {
  return [[Markup.button.callback(`‹ Назад`, 'admin|users|1')]];
};
