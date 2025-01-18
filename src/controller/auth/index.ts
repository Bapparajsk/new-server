import login from './login';
import register from "./register";
import {verifyOtp, sendOtp, loginWithOtp, primaryDeviceVerifyOtp} from "./otp";
import { logoutDevice, logoutDevices, logout } from "./logout";
import {setPrimaryDevice, removePrimaryDevice} from "./primaryDevice";

export {
    login, register,
    // otp verification and sending otp functions
    verifyOtp, sendOtp, loginWithOtp, primaryDeviceVerifyOtp,
    // logout functions
    logoutDevice, logoutDevices, logout,
    // register primary device function
    setPrimaryDevice, removePrimaryDevice,
};
