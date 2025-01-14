import { Request } from 'express';
import {User} from "../schema/user.schema";


declare module 'express-serve-static-core' {
    interface Request {
        User?: User;
    }
}
