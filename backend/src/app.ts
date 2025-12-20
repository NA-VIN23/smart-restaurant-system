import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes/index';
import { errorHandler, AppError } from './middleware/error.middleware';

const app = express();

// Basic security
app.use(helmet());

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS with credentials for the frontend dev server
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount API routes
app.use('/api/v1', routes);

// Handle unhandled routes
app.use((req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

export default app;
