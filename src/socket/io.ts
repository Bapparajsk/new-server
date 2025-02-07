import { Socket } from 'socket.io';
import * as db from "./socketDb";

export function handleConnection(socket: Socket) {
    const socketId = socket.id;

    socket.on('disconnect', () => {
        db.setOffline(socketId);
    });

    socket.on('login', (userId: string) => {
        db.setOnline(socketId, userId);
    });

    socket.on('logout', () => {
        db.setOffline(socketId);
    });
}
