"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
describe('helpers utilities', () => {
    test('calculateEstimatedWaitTime returns 0 for position 0', () => {
        expect((0, helpers_1.calculateEstimatedWaitTime)(0)).toBe(0);
    });
    test('calculateEstimatedWaitTime returns 10 for position 2', () => {
        expect((0, helpers_1.calculateEstimatedWaitTime)(2)).toBe(10);
    });
    test('isFutureDate correctly identifies future dates', () => {
        const future = new Date(Date.now() + 60 * 60 * 1000); // 1 hour ahead
        expect((0, helpers_1.isFutureDate)(future)).toBe(true);
    });
    test('isFutureDate returns false for past dates', () => {
        const past = new Date(Date.now() - 60 * 60 * 1000);
        expect((0, helpers_1.isFutureDate)(past)).toBe(false);
    });
});
//# sourceMappingURL=helpers.test.js.map