export const getLabelFromChannelType = (type: string) => {
  switch (type) {
    case 'start':
      return 'Старт';
    case 'task':
      return 'Задание';
    case 'all':
      return 'Везде';
    default:
      return 'Неизвестный тип канала';
  }
};
