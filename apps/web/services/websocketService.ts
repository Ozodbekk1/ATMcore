import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';

let io: SocketIOServer;

export function initWebSocketServer(server: HTTPServer) {
  if (!io) {
    io = new SocketIOServer(server, {
      path: '/api/realtime/ws',
      addTrailingSlash: false,
      cors: {
        origin: '*', // Set strict origin in production
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  return io;
}

export function getIO() {
  if (!io) {
    console.warn('WebSocket.io is not initialized yet');
  }
  return io;
}

export function emitAlert(atmId: string, severity: string, message: string) {
  const ioServer = getIO();
  if (ioServer) {
    ioServer.emit('alert', {
      atmId,
      event: 'CASH_RISK',
      severity,
      message,
      timestamp: new Date().toISOString()
    });
  }
}
