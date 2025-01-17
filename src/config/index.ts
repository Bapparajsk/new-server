import transporter from './nodemailer.config';
import { passport, authenticateAndRedirect } from "./passport.config";
import {messaging} from './firebase.config';
import AWS_S3 from "./aws.config";
import redisConfig from "./redis.config";

export { transporter, passport, authenticateAndRedirect, messaging, AWS_S3, redisConfig };
