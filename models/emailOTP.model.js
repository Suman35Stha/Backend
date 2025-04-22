import mongoose from "mongoose";

const emailOTPSchema = new mongoose.Schema({
    emailOTP: {
        type: String,
        default: null
    },
    emailOTPExpiry: {
        type: Date,
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

const emailOTPModel = mongoose.model("EmailOTP", emailOTPSchema);

export default emailOTPModel;
