import type { ITime } from '../types';

export const secondsToTime = (seconds: number): ITime => {
  const date = new Date(seconds * 1000);

  return {
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
    seconds: date.getUTCSeconds(),
  };
};
