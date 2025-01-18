import {model, Schema} from "mongoose";
import bcrypt from "bcrypt";
import * as schemas from "../schema/user.schema";
import {generateToken, verifyToken} from "../lib/jwt";
import { randomInt, hash } from 'crypto';

const MessageSchema = new Schema<schemas.Message>({
    message: {type: String, required: true},
    sender: {type: String, required: true},
    createdAt: {type: Date, default: Date.now}
});

const ChatRoomSchema = new Schema<schemas.ChatRoom>({
    userId: {type: String, required: true},
    messages: {type: [MessageSchema], default: []},
    nextRoom: {type: String, default: null},
    prevRoom: {type: String, default: null}
});

const FriendSchema = new Schema<schemas.Friend>({
    userId: {type: String, required: true},
    name: {type: String, required: true},
    title: {type: String, default: null},
    profilePicture: {type: String, default: null},
    createdAt: {type: Date, default: Date.now}
});

const NotificationSchema = new Schema<schemas.Notification>({
    name: {type: String, default: null},
    title: {type: String, default: null},
    imageSrc: {type: String, default: null},
    description: {type: String, default: null},
    link: {type: String, default: null},
    linkName: {type: String, default: null},
    type: {type: String, default: null}
});

const LoginDeviceSchema = new Schema<schemas.LoginDevice>({
    deviceId: {type: String, required: true},
    deviceName: {type: String, required: true},
    os: {type: String, required: true},
    lastLogin: {type: Date, default: Date.now},
    isPrimary: {type: Boolean, default: false}
})

const UserSchema = new Schema<schemas.User>({
    name: {type: String, required: true},
    title: {type: String, default: null},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: false, default: null},
    otp: {type: String, default: null},
    otpExpires: {type: Date, default: null},
    profilePicture: {type: String, default: null},
    coverPicture: {type: String, default: null},
    friends: {type: Map, of: FriendSchema, default: new Map()},
    friendRequests: {type: Map, of: FriendSchema, default: new Map()},
    friendRequestsSent: {type: Map, of: FriendSchema, default: new Map()},
    notifications: {type: [NotificationSchema], default: []},
    loginDevices: {type: Map, of: LoginDeviceSchema, default: new Map()},
    towFactorAuth: {type: Boolean, default: false},
    chatSystem: {
        chatRooms: {type: Map, of: ChatRoomSchema, default: new Map()},
        chatRoomHead: {type: String, default: null}
    },
    posts: {type: [String], default: []},
    likedPosts: {type: Map, of: String, default: new Map()},
    createdAt: {type: Date, default: Date.now}
});

// * Methods
// Compare password with hashed password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateToken = function (payload?: object , expiresIn: string = '1h'): string {
    return generateToken({_id: this._id, ...payload}, expiresIn);
};

// Verify JWT token
UserSchema.methods.verifyToken = function (token: string): object {
    return verifyToken(token);
};

// Generate OTP for password reset or email verification
UserSchema.methods.generateOTP = function (): string {
    const otp = randomInt(100000, 999999); // Generate a 6-digit OTP
    this.otp = otp.toString();
    this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    return otp.toString();
};

// * Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        if (this.password === null) return next();
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        console.error('password hash error:- ', err);
    } finally {
        next();
    }
});

const UserModel = model<schemas.User>('User', UserSchema);

export default UserModel;
