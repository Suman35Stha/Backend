import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateAccessToken = async (userId) => {
    const accessToken = await jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    // const refreshToken = await jwt.sign(userId, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    return { accessToken };
}

export default generateAccessToken;
