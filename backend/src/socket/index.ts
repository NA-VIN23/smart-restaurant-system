import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';

let io: IOServer | null = null;

export function initSocket(server: HttpServer) {
  if (io) return io;
  io = new IOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log('Socket connected:', socket.id);

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket not initialized');
  return io;
}
