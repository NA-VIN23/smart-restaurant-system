import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tableRoutes from './routes/table.routes';
import queueRoutes from './routes/queue.routes';
import reservationRoutes from './routes/reservation.routes';
import authRoutes from './routes/auth.routes';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows Angular to connect
app.use(express.json());

// Routes
// This creates the URL: http://localhost:3000/api/tables
app.use('/api/tables', tableRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/auth', authRoutes);

// Chat Route with Optional Auth
import { chatWithAgent } from './controllers/chat.controller';
const optionalAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        req.user = null; // Guest
        return next();
    }
    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'secret', (err: any, user: any) => {
        // If token invalid, treat as Guest? Or error?
        // Let's treat as Guest to avoid blocking chat if token expired.
        if (err) req.user = null;
        else req.user = user;
        next();
    });
};
app.post('/api/chat', optionalAuth, chatWithAgent);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});