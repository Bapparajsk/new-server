import {Types} from "mongoose";
import {Notification} from "../../schema/user.schema";

export interface UserNotificationType {
    id: string | Types.ObjectId;
    notification: Notification;
    pushNotificationToken?: string | null;
}
