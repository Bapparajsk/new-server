import {Types} from "mongoose";
import {Notification} from "../../schema/user.schema";

export interface UserNotificationType {
    id: string;
    notification: Notification;
    pushNotificationToken?: string | null;
}
