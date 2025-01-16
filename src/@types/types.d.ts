import { Request } from 'express';
import {LoginDevice, User} from "../schema/user.schema";


declare module 'express-serve-static-core' {
    interface Request {
        User?: User;
        deviceId?: string
    }
}
