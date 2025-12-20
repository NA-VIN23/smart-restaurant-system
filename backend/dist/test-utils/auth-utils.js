"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserAndGetToken = createUserAndGetToken;
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
async function createUserAndGetToken(user) {
    const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/auth/signup').send(user);
    if (res.status !== 201) {
        throw new Error(`Failed to create user: ${res.status} ${JSON.stringify(res.body)}`);
    }
    return { token: res.body.token, user: res.body.data.user };
}
//# sourceMappingURL=auth-utils.js.map