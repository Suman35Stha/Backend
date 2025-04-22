import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import refreshTokenModel from "../models/refreshToken.model.js";
import userModel from "../models/user.model.js";

dotenv.config();

const generateRefreshToken = async (userId) => {
    const refreshToken = await jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    const findRefreshToken = await refreshTokenModel.findOne({ userId: userId });
    //if the refresh token already exists, delete it
    if(findRefreshToken) {
        await refreshTokenModel.deleteOne({ userId: userId });
    }
    //create a new refresh token
    const refreshTokenData = await refreshTokenModel.create({
        refresh_Token: refreshToken,
        userId: userId,
        expiresIn: "7d"
    });

    if(!refreshTokenData) {
        return { refreshToken: null };
    }

    const updateRefreshToken = await refreshTokenModel.findByIdAndUpdate(refreshTokenData._id, { refresh_Token: refreshToken });

    if(!updateRefreshToken) {
        return { refreshToken: null };
    }

    return { refreshToken };
}

export default generateRefreshToken;
