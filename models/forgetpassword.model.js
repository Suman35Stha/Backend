import mongoose from "mongoose";

const forgetPasswordSchema = new mongoose.Schema({
    forget_password_otp: {
        type: String,
        default: null
    },
    forget_password_otp_expiry: {
        type: Date,
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    is_verified: {
        type: Boolean,
        default: false
    }
});

const forgetPasswordModel = mongoose.model("ForgetPassword", forgetPasswordSchema);

export default forgetPasswordModel;