import { calculateEstimatedWaitTime, isFutureDate } from './helpers';

describe('helpers utilities', () => {
  test('calculateEstimatedWaitTime returns 0 for position 0', () => {
    expect(calculateEstimatedWaitTime(0)).toBe(0);
  });

  test('calculateEstimatedWaitTime returns 10 for position 2', () => {
    expect(calculateEstimatedWaitTime(2)).toBe(10);
  });

  test('isFutureDate correctly identifies future dates', () => {
    const future = new Date(Date.now() + 60 * 60 * 1000); // 1 hour ahead
    expect(isFutureDate(future)).toBe(true);
  });

  test('isFutureDate returns false for past dates', () => {
    const past = new Date(Date.now() - 60 * 60 * 1000);
    expect(isFutureDate(past)).toBe(false);
  });
});
