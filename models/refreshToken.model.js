import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
    refresh_Token: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    expiresIn: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '7d' // Automatically delete documents after 7 days
    }
});

const refreshTokenModel = mongoose.model("RefreshToken", refreshTokenSchema);

export default refreshTokenModel; 