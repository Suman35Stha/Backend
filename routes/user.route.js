import { Router } from "express";
import { createUser, verifyEmail, resendVerificationEmail, loginUser, logoutUser, uploadUserImage, getUserDetails, updateUserDetails, forgotPassword, verifyForgotPasswordOTP, resetPassword, refreshToken } from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
const router = Router();

// User registration and verification routes
router.post("/createUser", createUser); //create a new user
router.post("/verify-email", verifyEmail); //verify email with OTP
router.post("/resend-verification", resendVerificationEmail); //resend verification OTP
router.post("/login", loginUser); //login user
router.get("/logout", auth, logoutUser); //logout user
router.put("/upload-user-image", auth, upload.single("image"), uploadUserImage); //upload user image
router.get("/getUserDetails", auth, getUserDetails); //get user details
router.put("/updateUserDetails", auth, updateUserDetails); //update user details
router.post("/forgot-password", forgotPassword); //forgot password
router.post("/verify-forgot-password-otp", verifyForgotPasswordOTP); //verify forgot password OTP
router.post("/reset-password", resetPassword); //reset password
router.post("/refresh-token", refreshToken); //refresh token

export default router;
