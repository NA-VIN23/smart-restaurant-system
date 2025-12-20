import http from 'http';
import app from './app';
import 'dotenv/config';
import { initSocket } from './socket';

const port = process.env.PORT || 3000;

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('Process terminated');
  });
});
