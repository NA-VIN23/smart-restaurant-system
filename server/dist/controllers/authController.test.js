"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
let authController;
const pool = require('../config/database');
jest.mock('../config/database', () => ({
    __esModule: true,
    default: { query: jest.fn() }
}));
const mockedPool = (pool.default || pool);
describe('authController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('register - success', async () => {
        const req = { body: { name: 'Test', email: 't@example.com', password: 'secret1', role: 'Customer' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        // Simulate no existing user and successful insert
        mockedPool.query.mockResolvedValueOnce([[]]); // check existing
        mockedPool.query.mockResolvedValueOnce([{ insertId: 1 }]); // insert
        authController = await Promise.resolve().then(() => __importStar(require('./authController')));
        await authController.register(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalled();
    });
    test('register - existing user', async () => {
        const req = { body: { name: 'Test', email: 't@example.com', password: 'secret1', role: 'Customer' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        mockedPool.query.mockResolvedValueOnce([[{ id: 1 }]]); // existing
        authController = await Promise.resolve().then(() => __importStar(require('./authController')));
        await authController.register(req, res);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
    test('login - success', async () => {
        const req = { body: { email: 't@example.com', password: 'secret1' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const fakeUser = { id: 1, email: 't@example.com', password: await Promise.resolve('$2b$10$saltsaltsalt hashed'), name: 'Test', role: 'Customer' };
        mockedPool.query.mockResolvedValueOnce([[fakeUser]]); // select user
        // mock comparePassword via helper import
        jest.spyOn(require('../utils/helpers'), 'comparePassword').mockResolvedValueOnce(true);
        authController = await Promise.resolve().then(() => __importStar(require('./authController')));
        await authController.login(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalled();
    });
    test('login - invalid credentials', async () => {
        const req = { body: { email: 't@example.com', password: 'bad' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        mockedPool.query.mockResolvedValueOnce([[]]); // user not found
        authController = await Promise.resolve().then(() => __importStar(require('./authController')));
        await authController.login(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
});
//# sourceMappingURL=authController.test.js.map