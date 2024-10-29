interface IMessage {
  label?: string;
  value: string;
}

export const getBeautyMessage = (message: IMessage) => {
  if (message.label) {
    return `<b>${message.label}:</b> ${message.value}\n`;
  }

  return `${message.value}\n`;
};
