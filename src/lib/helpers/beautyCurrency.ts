export const beautyCurrency = (amount: number, numbersOfDigits = 2) => {
  const numberToString = amount.toString();

  if (numberToString.length >= 5) {
    return amount.toFixed(3);
  }

  return amount.toFixed(numbersOfDigits);
};
