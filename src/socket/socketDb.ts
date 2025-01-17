const userOnlineSet = new Map<string, string>();

const userOnlineAdd = (socketId: string ,userId: string) => {
    if (!userOnlineSet.has(userId)) {
        userOnlineSet.set(userId, socketId);
    }
}

const userOnlineDelete = (userId: string) => {
    userOnlineSet.delete(userId);
}

const isOnline = (userId: string) => {
    return userOnlineSet.has(userId);
}

export { userOnlineAdd, userOnlineDelete, isOnline };
