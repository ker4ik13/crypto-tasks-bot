export const logAtCurrentNumber = (
  currentNumber: number,
  logAt: number,
  text: string,
) => {
  if (currentNumber % logAt === 0) {
    console.log(text);
  }
};
