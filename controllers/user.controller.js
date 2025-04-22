import userModel from "../models/user.model.js";
// import bcrypt from "bcrypt";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../config/sendEmail.js";
import verifyEmailTemp from "../utils/verifyEmailTemp.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import refreshTokenModel from "../models/refreshToken.model.js";
import generateOTP from "../utils/generateOTP.js";
import emailOTPModel from "../models/emailOTP.model.js";
import uploadImage from "../utils/uploadImage.js";
import formatDate from "../utils/formatDate.js";
import forgotPasswordModel from "../models/forgetpassword.model.js";
import forgotPasswordTemp from "../utils/forgotPasswordTemp.js";

//create user
export const createUser = async (req, res) => {
    const { name, email, password, mobile } = req.body;
    try {
        if(!email || !password || !name || !mobile) {
            return res.status(400).json({ message: "All fields are required", error: true, success: false });
        }
        const userExist = await userModel.findOne({ email });
        if(userExist) {
            return res.status(400).json({ message: "User already exists", error: true, success: false });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        
        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

        const user = await userModel.create({ 
            name, 
            email, 
            password: hashedPassword, 
            mobile
        });

        if(!user) {
            return res.status(400).json({ message: "User creation failed", error: true, success: false });
        }

        // Create email OTP record
        const emailOTP = await emailOTPModel.create({
            emailOTP: otp,
            emailOTPExpiry: otpExpiry,
            userId: user._id
        });

        if(!emailOTP) {
            return res.status(400).json({ message: "OTP creation failed", error: true, success: false });
        }

        try {
            const emailSent = await sendEmail({
                to: user.email,
                subject: "Verify your email with OTP - Blinkit",
                html: verifyEmailTemp({
                    name: user.name,
                    otp: otp
                })
            });

            if (!emailSent.success) {
                console.error("Email OTP sending failed:", emailSent.error);
            } else {
                console.log("Email OTP sent successfully to:", user.email);
            }
        } catch (emailError) {
            console.error("Email sending error:", emailError);
        }

        res.status(201).json({ 
            message: "User created successfully. Please check your email for OTP.", 
            data: {
                userId: user._id,
                email: user.email,
                nextStep: "verify-email"
            },
            success: true 
        });

    } catch (error) {
        console.error("User creation error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

//verify email
export const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "User not found", error: true, success: false });
        }

        if(user.verify_email) {
            return res.status(400).json({ message: "Email already verified", error: true, success: false });
        }

        // Get the latest OTP for this user
        const emailOTP = await emailOTPModel.findOne({ 
            userId: user._id,
            emailOTPExpiry: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if(!emailOTP) {
            return res.status(400).json({ message: "No valid OTP found", error: true, success: false });
        }

        if(emailOTP.emailOTP !== otp) {
            return res.status(400).json({ message: "Invalid OTP", error: true, success: false });
        }

        // Update user verification status
        const updatedUser = await userModel.findByIdAndUpdate(user._id, { 
            verify_email: true
        });

        if(!updatedUser) {
            return res.status(400).json({ message: "Email verification failed", error: true, success: false });
        }

        // Clear the used OTP
        await emailOTPModel.findByIdAndDelete(emailOTP._id);

        res.status(200).json({ 
            message: "Email verified successfully", 
            data: {
                userId: user._id,
                email: user.email,
                nextStep: "login"
            },
            success: true, 
            error: false 
        });
        
    } catch (error) {
        console.error("Email verification error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

//resend verification email
export const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "User not found", error: true, success: false });
        }
        if(user.verify_email) {
            return res.status(400).json({ message: "Email already verified", error: true, success: false });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

        //check existing OTP
        const existingOTP = await emailOTPModel.findOne({ userId: user._id });
        if(existingOTP) {
            await emailOTPModel.findByIdAndDelete(existingOTP._id);
        }
        
        // Create new OTP record
        const emailOTP = await emailOTPModel.create({
            emailOTP: otp,
            emailOTPExpiry: otpExpiry,
            userId: user._id
        });

        if(!emailOTP) {
            return res.status(400).json({ message: "OTP creation failed", error: true, success: false });
        }

        try {
            const emailSent = await sendEmail({
                to: user.email,
                subject: "New OTP for Email Verification - Blinkit",
                html: verifyEmailTemp({
                    name: user.name,
                    otp: otp
                })
            });

            if (!emailSent.success) {
                console.error("Email OTP sending failed:", emailSent.error);
            } else {
                console.log("Email OTP sent successfully to:", user.email);
            }
        } catch (error) {
            console.error("Email sending error:", error);
        }

        res.status(200).json({ 
            message: "New OTP sent successfully", 
            data: {
                userId: user._id,
                email: user.email
            },
            success: true, 
            error: false 
        });
    } catch (error) {
        console.error("Resend verification email error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

//login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email }); //find the user by email
        if(!user) {
            return res.status(400).json({ message: "User not found", error: true, success: false });
        }
        
        if (!user.status === "active") {
            return res.status(400).json({ message: "User is inactive", error: true, success: false });
        }
        
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password", error: true, success: false });
        }
        if (!user.verify_email) {
            return res.status(400).json({ message: "Email not verified", error: true, success: false });
        }
        
        const accessToken = await generateAccessToken(user._id); //generate the access token
        const refreshToken = await generateRefreshToken(user._id); //generate the refresh token

        // Update last login time
        await userModel.findByIdAndUpdate(user._id, {
            last_login: formatDate(new Date())
        });

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            // secure: process.env.NODE_ENV !== "development",
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000 //15 minutes
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
        });
        
        res.status(200).json({
            message: "Login successful",
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    last_login: formatDate(new Date())
                },
                accessToken: accessToken,
                refreshToken: refreshToken
            },
        });
        
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

//logout user
export const logoutUser = async (req, res) => {
    // const { accessToken } = req.body;
    const userId = req.userId; //middleware
    try {
        //const user = await refreshTokenModel.findOne({ accessToken });
        if(!userId) {
            return res.status(400).json({ message: "User not found", error: true, success: false }); //400 is the status code for bad request
        }
       
        const refreshTokenCookie = {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 0
        }
        const accessTokenCookie = {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 0
        }
        res.clearCookie("refreshToken", refreshTokenCookie); //clear the refresh token
        res.clearCookie("accessToken", accessTokenCookie); //clear the access token
        
        await refreshTokenModel.deleteOne({ "userId": userId });

        res.status(200).json({ message: "Logout successful", success: true, error: false }); //200 is the status code for success
    } catch (error) {
        console.error("Logout error:", error); //if the logout failed
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        }); //500 is the status code for internal server error
    }
}

//upload user image
export const uploadUserImage = async (req, res) => {
    try {
        const userId = req.userId; //auth middleware
        const image = req.file; //multer middleware
        //check if the image is uploaded
        if(!image) {
            return res.status(400).json({ message: "Image is required", error: true, success: false });
        }
        //upload the image
        const uploadedImage = await uploadImage(image);
        //update the user image
        await userModel.findByIdAndUpdate(userId, {
            image: uploadedImage.url
        });
        //send the response
        res.status(200).json({
            message: "Image uploaded successfully",
            success: true,
            data: uploadedImage
        });
    } catch (error) {   
        console.error("Upload user image error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

//get user details
export const getUserDetails = async (req, res) => {
    const userId = req.userId; //auth middleware
    try {
        const user = await userModel.findById(userId);
        if(!user) {
            return res.status(400).json({ message: "User not found", error: true, success: false });
        }
        res.status(200).json({
            message: "User fetched successfully",
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

//update user details
export const updateUserDetails = async (req, res) => {
    const userId = req.userId; //auth middleware
    const updateData = { ...req.body }; // Get all fields from request body
    try {
        //check if the user exists
        const user = await userModel.findById(userId);
        if(!user) {
            return res.status(400).json({ message: "User not found", error: true, success: false });
        }

        // If password is being updated, hash it
        if(updateData.password) {
            const salt = await bcryptjs.genSalt(10);
            updateData.password = await bcryptjs.hash(updateData.password, salt);
        }

        //update the user details
        const updatedUser = await userModel.findByIdAndUpdate(userId, {
            ...updateData,
            $inc: { __v: 1 } // Increment the version number
        }, { new: true }); // Return the updated document

        res.status(200).json({
            message: "User updated successfully",
            success: true,
            data: updatedUser
        });
    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

//forgot password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "User not found", error: true, success: false });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

        // Delete any existing OTP for this user
        await forgotPasswordModel.deleteMany({ userId: user._id });
        
        // Create new OTP record
        const forgotPasswordOTP = await forgotPasswordModel.create({
            forget_password_otp: otp,
            forget_password_otp_expiry: otpExpiry,
            userId: user._id
        });

        if(!forgotPasswordOTP) {
            return res.status(400).json({ message: "OTP creation failed", error: true, success: false });
        }

        try {
            const emailSent = await sendEmail({
                to: user.email,
                subject: "Forgot Password OTP - Blinkit",
                html: forgotPasswordTemp({
                    name: user.name,
                    otp: otp
                })
            });

            if (!emailSent.success) {
                console.error("Email OTP sending failed:", emailSent.error);
            } else {
                console.log("Email OTP sent successfully to:", user.email);
            }
        } catch (error) {
            console.error("Email sending error:", error);
        }

        res.status(200).json({
            message: "Forgot password OTP sent successfully",
            success: true,
            data: {
                userId: user._id,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

//verify forgot password OTP
export const verifyForgotPasswordOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
       if (!email || !otp) {
            return res.status(400).json({ 
                message: "Email or OTP are required", 
                error: true, 
                success: false 
            });
        }

        const user = await userModel.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "User not found", error: true, success: false });
        }

        // Get the latest OTP for this user
        const forgotPasswordOTP = await forgotPasswordModel.findOne({ 
            userId: user._id,
            forget_password_otp_expiry: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if(!forgotPasswordOTP) {
            return res.status(400).json({ message: "No valid OTP found", error: true, success: false });
        }

        if(forgotPasswordOTP.forget_password_otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP", error: true, success: false });
        }

        // Mark OTP as verified
        await forgotPasswordModel.findByIdAndUpdate(forgotPasswordOTP._id, {
            is_verified: true
        });

        res.status(200).json({
            message: "OTP verified successfully",
            success: true,
            data: {
                userId: user._id,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

//reset password
export const resetPassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
    try {
        //check if the email, new password and confirm password are provided
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({ 
                message: "Email and new password are required", 
                error: true, 
                success: false 
            });
        }
        //check if the new password and confirm password are the same
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "New password and confirm password do not match",
                error: true,
                success: false
            });
        }
        //check if the user exists
        const user = await userModel.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: "User not found", error: true, success: false });
        }
        //check if the OTP is verified
        const forgotPasswordOTP = await forgotPasswordModel.findOne({ 
            userId: user._id,
            is_verified: true
        });
        //check if the OTP is invalid or expired
        if(!forgotPasswordOTP) {
            return res.status(400).json({ message: "Invalid or expired OTP", error: true, success: false });
        }
        //check if the new password is same as the current password
        const isSamePassword = await bcryptjs.compare(newPassword, user.password);
        if(isSamePassword) {
            return res.status(400).json({ 
                message: "New password cannot be same as current password", 
                error: true, 
                success: false 
            });
        }

        // Hash the new password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);

        // Set password expiry date (90 days from now)
        const passwordExpiryDate = new Date();
        passwordExpiryDate.setDate(passwordExpiryDate.getDate() + 90); //90 days from now

        // Update password, expiry date and increment version
        const updatedUser = await userModel.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            password_expiry_date: passwordExpiryDate,
            $inc: { __v: 1 }
        }, { new: true });

        // Delete the used OTP
        await forgotPasswordModel.findByIdAndDelete(forgotPasswordOTP._id);

        res.status(200).json({
            message: "Password reset successfully",
            success: true,
            data: {
                userId: user._id,
                email: user.email,
                password_expiry_date: passwordExpiryDate
            }
        });
        
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

//refresh token
export const refreshToken = async (req, res) => {
    try {
        //get the refresh token from the cookies or header
        const refreshToken = req.cookies.refreshToken || req.headers.authorization?.split(" ")[1];
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required", error: true, success: false });
        }
        console.log(refreshToken);
        //verify the refresh token        
        const decodedToken = jwt.verify(refreshToken.refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!decodedToken) {
            return res.status(400).json({ message: "Invalid refresh token", error: true, success: false });
        }
        //get the user id from the decoded token
        const userId = decodedToken.userId;
        //check if the user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found", error: true, success: false });
        }
        //check if the user is active
        if (!user.status === "active") {
            return res.status(400).json({ message: "User is inactive", error: true, success: false });
        }
        //old refresh token
        const oldRefreshToken = await refreshTokenModel.findOne({ "userId": userId });
        console.log(oldRefreshToken);
        //check token valid
        if (!oldRefreshToken || oldRefreshToken.refresh_Token !== refreshToken.refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token", error: true, success: false });
        }
        //get expire or not
        const isExpired = new Date(oldRefreshToken.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000) < new Date();
        //clear all if expire
        if (isExpired) {
            // Clear cookies
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 0
            });
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 0
            });
            
            // Delete refresh token from database
            await refreshTokenModel.deleteOne({ userId: userId });
            
            // Call logout API
            return res.status(401).json({ 
                message: "Refresh token expired. Please login again.", 
                error: true, 
                success: false,
                action: "logout"
            });
        }
        
        // If token is not expired, generate new access token
        const newAccessToken = await generateAccessToken(user._id);
        
        // Set new access token cookie
        res.cookie("accessToken", newAccessToken.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000 //15 minutes
        });

        res.status(200).json({ 
            message: "Access token refreshed successfully", 
            success: true, 
            error: false,
            data: {
                accessToken: newAccessToken.accessToken
            }
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}