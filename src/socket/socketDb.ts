const UserByUserId = new Map<string, string>();
const UserBySocketId = new Map<string, string>();

export function setOnline(socketId: string, userId: string) {
    UserByUserId.set(userId, socketId);
    UserBySocketId.set(socketId, userId);
}

export function setOffline(socketId: string) {
    const userId = UserBySocketId.get(socketId);
    if (!userId) return;

    UserByUserId.delete(userId);
    UserBySocketId.delete(socketId);
}

export function isOnlineBySocketId(socketId: string) {
    return UserBySocketId.has(socketId);
}

export function isOnlineByUserId(userId: string) {
    return UserByUserId.has(userId);
}
