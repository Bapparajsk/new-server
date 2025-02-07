import transporter from './nodemailer.config';
import { passport, authenticateAndRedirect } from "./passport.config";
// import {messaging} from './firebase.config';
import AWS_S3 from "./aws.config";
import redisConfig from "./redis.config";
import { userNotificationQueue } from "./bullmq.config";

export { transporter, passport, authenticateAndRedirect, AWS_S3, redisConfig, userNotificationQueue };
