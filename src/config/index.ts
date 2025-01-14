import transporter from './nodemailer.config';
import { passport, authenticateAndRedirect } from "./passport.config";

export { transporter, passport, authenticateAndRedirect };
