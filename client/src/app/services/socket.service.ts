import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket) return;
    try {
      this.socket = io('http://localhost:3000');
      this.socket.on('connect', () => console.log('Socket connected', this.socket?.id));
    } catch (e) {
      console.warn('Socket connect failed', e);
      this.socket = null;
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  on(event: string, handler: (...args: any[]) => void) {
    this.socket?.on(event, handler);
  }

  emit(event: string, payload?: any) {
    this.socket?.emit(event, payload);
  }
}
