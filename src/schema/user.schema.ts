import { Document } from "mongoose";
import {verifyToken} from "../lib/jwt";

export interface User extends Document {
    // user Details
    name: string;
    title: string | null;
    email: string;
    password: string | null;
    otp: string | null;
    otpExpires: Date | null;
    profilePicture: string | null;
    // Friends and Notifications
    friends: Map<string, Friend>;
    friendRequests: Map<string, Friend>;
    friendRequestsSent: Map<string, Friend>;
    notifications: Map<string, Notification>;
    // Security
    loginDevices: Map<string, LoginDevice>;
    towFactorAuth: boolean;
    // Chat
    chatSystem: {
        chatRooms: Map<string, ChatRoom>;
        chatRoomHead: string | null;
    };
    // Posts
    posts: string[];
    likedPosts: Map<string, string>;
    createdAt: Date;

    // Methods
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateToken(payload?: object, expiresIn?: string): string;
    verifyToken(token: string): object;
    generateOTP(): string;
}

export interface ChatRoom {
    userId: string;
    messages: Message[];
    nextRoom: string | null;
    prevRoom: string | null;
}

export interface Message {
    message: string;
    sender: string;
    createdAt: Date;
}

export interface Friend {
    userId: string;
    name: string;
    title: string | null;
    profilePicture: string | null;
    createdAt: Date;
}

export interface Notification {
    name?: string;
    title?: string;
    imageSrc?: string;
    description?: string | undefined;
    link?: string;
    linkName?: string;
    type?: "post" | "friend-request" | "comment" | "like" | "share" | "friend-reject" | "message" | "notification" | undefined;
}

export interface LoginDevice {
    deviceId: string;
    deviceName: string;
    os: string;
    lastLogin: Date;
    isPrimary: boolean;
}
