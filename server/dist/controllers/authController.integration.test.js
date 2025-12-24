"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
jest.mock('../config/database', () => ({
    __esModule: true,
    default: { query: jest.fn() }
}));
const pool = require('../config/database');
const db = pool.default || pool;
let app;
try {
    const serverModule = require('../server');
    console.log('server module keys:', Object.keys(serverModule || {}));
    app = serverModule.default || serverModule;
}
catch (err) {
    console.error('Error requiring server module:', err);
}
describe('Auth routes integration (mocked DB)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('POST /api/register - success', async () => {
        // No existing user
        db.query.mockResolvedValueOnce([[]]);
        // Insert returns insertId
        db.query.mockResolvedValueOnce([{ insertId: 2 }]);
        // Debug: log routes registered on the app
        try {
            const authRoutesModule = require('../routes/authRoutes');
            console.log('DEBUG authRoutes module keys:', Object.keys(authRoutesModule || {}));
            console.log('DEBUG authRoutes export:', authRoutesModule.default || authRoutesModule);
            const routes = (app && app._router && app._router.stack) ? app._router.stack.filter((s) => s.route).map((s) => s.route.path) : [];
            console.log('DEBUG app routes:', routes);
        }
        catch (err) {
            console.warn('Could not list routes on app', err);
        }
        const res = await (0, supertest_1.default)(app).post('/api/register').send({ name: 'New', email: 'new@example.com', password: 'secret1', role: 'Customer' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('token');
    });
    test('POST /api/login - invalid credentials', async () => {
        db.query.mockResolvedValueOnce([[]]); // user not found
        const res = await (0, supertest_1.default)(app).post('/api/login').send({ email: 'nope@example.com', password: 'bad' });
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('success', false);
    });
});
//# sourceMappingURL=authController.integration.test.js.map