export const beautyCurrency = (amount: number, numbersOfDigits = 2) => {
  if (!amount) {
    return amount || 0;
  }

  const defaultDigitsLength = 7;

  const numbersOfDigitsInAmountSplit = amount.toString().split('.');

  if (!numbersOfDigitsInAmountSplit || !numbersOfDigitsInAmountSplit[1]) {
    return amount.toFixed(numbersOfDigits);
  }

  const numbersOfDigitsInAmount = amount.toString().split('.')[1].length;

  if (numbersOfDigitsInAmount >= 5) {
    return amount.toFixed(defaultDigitsLength);
  }

  return amount.toFixed(numbersOfDigits);
};

export const strongBeautyCurrency = (amount: number, numbersOfDigits = 2) => {
  if (!amount) {
    return amount.toFixed() || (0).toFixed();
  }

  return amount.toFixed(numbersOfDigits);
};
