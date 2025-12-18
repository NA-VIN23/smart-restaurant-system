import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tableRoutes from './routes/table.routes';
import queueRoutes from './routes/queue.routes';
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

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});