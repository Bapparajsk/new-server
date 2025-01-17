import { Socket } from 'socket.io';
import { isOnline, userOnlineAdd, userOnlineDelete } from "./socketDb";

export function handleConnection(socket: Socket) {
    const socketId = socket.id;

    socket.on('disconnect', () => {
        userOnlineDelete(socketId);
    });

    socket.on('login', (userId: string) => {
        userOnlineAdd(socketId, userId);
    });

}
