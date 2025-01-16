import login from './login';
import register from "./register";
import {verifyOtp, sendOtp, loginWithOtp, registerPrimaryDeviceVerifyOtp} from "./otp";
import { logoutDevice, logoutDevices, logout } from "./logout";
import registerPrimaryDevice from "./registerPrimaryDevice";

export {
    login, register,
    // otp verification and sending otp functions
    verifyOtp, sendOtp, loginWithOtp, registerPrimaryDeviceVerifyOtp,
    // logout functions
    logoutDevice, logoutDevices, logout,
    // register primary device function
    registerPrimaryDevice,
};
