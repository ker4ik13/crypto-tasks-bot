import { HistoryPaginationType } from '@/lib/types';
import { Markup } from 'telegraf';

export const paginationKeyboard = (
  { hasNextPage, hasPreviousPage, page, pages }: HistoryPaginationType<any>,
  path: string,
) => {
  const buttons = [];

  if (pages && pages <= 5) {
    [...new Array(pages)].map((_, index) => {
      buttons.push(
        Markup.button.callback(
          `${index + 1 === page ? `•${page}•` : index + 1}`,
          `${path}|${index + 1}`,
        ),
      );
    });
  } else {
    if (hasPreviousPage && page >= 3) {
      buttons.push(Markup.button.callback('« 1', `${path}|1`));
    }
    if (hasPreviousPage) {
      buttons.push(
        Markup.button.callback(`‹ ${page - 1}`, `${path}|${page - 1}`),
      );
    }

    buttons.push(Markup.button.callback(`• ${page} •`, `${path}|${page}`));

    if (hasNextPage) {
      buttons.push(
        Markup.button.callback(`${page + 1} ›`, `${path}|${page + 1}`),
      );
    }
    if (hasNextPage && page <= pages - 2) {
      buttons.push(Markup.button.callback(`${pages} »`, `${path}|${pages}`));
    }
  }

  return buttons;
};
