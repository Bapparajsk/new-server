import login from './login';
import register from "./register";
import {verifyOtp, sendOtp, loginWithOtp, primaryDeviceVerifyOtp, towFactorAuthOtpVerify} from "./otp";
import { logoutDevice, logoutDevices, logout } from "./logout";
import {setPrimaryDevice, removePrimaryDevice} from "./primaryDevice";
import { towFactorAuth } from "./2fa";

export {
    login, register,
    // otp verification and sending otp functions
    verifyOtp, sendOtp, loginWithOtp, primaryDeviceVerifyOtp,
    // logout functions
    logoutDevice, logoutDevices, logout,
    // register primary device function
    setPrimaryDevice, removePrimaryDevice,
    // 2FA functions
    towFactorAuthOtpVerify, towFactorAuth
};
