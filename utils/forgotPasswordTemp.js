import dotenv from "dotenv";

dotenv.config();

const forgotPasswordTemp = ({ name, otp }) => {
    return `
    <div style="margin: 0; padding: 0; background-color: #f5f6fa; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f6fa; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <tr>
                            <td align="center" style="padding: 40px 30px 20px;">
                                <img src="${process.env.FRONTEND_URL}/logo.png" alt="Blinkit Logo" width="60" height="60" style="display: block; margin-bottom: 20px;">
                                <h1 style="margin: 0; font-size: 24px; color: #333;">Forgot Password OTP</h1>
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style="padding: 0 30px 20px;">
                                <p style="font-size: 16px; color: #555;">Hello <strong>${name}</strong>,</p>
                                <p style="font-size: 16px; color: #555;">Your OTP for forgot password is:</p>
                                <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f0f0f0; border-radius: 6px;">
                                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
                                </div>
                                <p style="font-size: 14px; color: #999;">This OTP is valid for 10 minutes only.</p>
                                <p style="font-size: 14px; color: #999;">If you didn't request this OTP, please ignore this email.</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 20px 30px; font-size: 12px; color: #aaa; background-color: #f0f0f0;">
                                &copy; 2025 Blinkit Inc. All rights reserved.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
    `;
};

export default forgotPasswordTemp;
