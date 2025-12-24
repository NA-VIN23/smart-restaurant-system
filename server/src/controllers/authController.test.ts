let authController: any;
const pool = require('../config/database');

jest.mock('../config/database', () => ({
  __esModule: true,
  default: { query: jest.fn() }
}));

const mockedPool = (pool.default || pool) as unknown as { query: jest.Mock };

describe('authController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register - success', async () => {
    const req: any = { body: { name: 'Test', email: 't@example.com', password: 'secret1', role: 'Customer' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    // Simulate no existing user and successful insert
    mockedPool.query.mockResolvedValueOnce([[]]); // check existing
    mockedPool.query.mockResolvedValueOnce([{ insertId: 1 }]); // insert

    authController = await import('./authController');
    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  test('register - existing user', async () => {
    const req: any = { body: { name: 'Test', email: 't@example.com', password: 'secret1', role: 'Customer' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    mockedPool.query.mockResolvedValueOnce([[{ id: 1 }]]); // existing

    authController = await import('./authController');
    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('login - success', async () => {
    const req: any = { body: { email: 't@example.com', password: 'secret1' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const fakeUser = { id: 1, email: 't@example.com', password: await Promise.resolve('$2b$10$saltsaltsalt hashed'), name: 'Test', role: 'Customer' };

    mockedPool.query.mockResolvedValueOnce([[fakeUser]]); // select user

    // mock comparePassword via helper import
    jest.spyOn(require('../utils/helpers'), 'comparePassword').mockResolvedValueOnce(true);

    authController = await import('./authController');
    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test('login - invalid credentials', async () => {
    const req: any = { body: { email: 't@example.com', password: 'bad' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    mockedPool.query.mockResolvedValueOnce([[]]); // user not found

    authController = await import('./authController');
    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});
