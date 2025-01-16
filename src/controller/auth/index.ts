import login from './login';
import register from "./register";
import {verifyOtp, sendOtp, loginWithOtp} from "./otp";
import { logoutDevice, logoutDevices, logout } from "./logout";

export {
  login,                // export login function from login.ts
  register,             // export register function from register.ts
  verifyOtp,            // export verifyOtp function from otp.ts
  sendOtp,              // export sendOtp function from otp.ts
  loginWithOtp,         // export loginWithOtp function from otp.ts
  logoutDevice,         // export logoutDevice function from logout.ts
  logoutDevices,        // export logoutDevices function from logout.ts
  logout,               // export logout function from logout.ts
};
