import { io } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

// We initialize the socket manually, without connecting
export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
});
