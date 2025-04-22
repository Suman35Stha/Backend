import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const auth = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        let token = req.cookies.accessToken;
        
        // If no token in cookies, check Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Remove 'Bearer ' prefix
            }
        }

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        //print the token
        console.log(token);

        // Verify token
        const decoded = await jwt.verify(token.accessToken.trim(), process.env.ACCESS_TOKEN_SECRET);
        
        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                message: "Invalid token structure",
                error: true,
                success: false
            });
        }

        console.log(decoded);

        // Attach user info to request
        req.userId = decoded.userId;
        // req.user = decoded.userId;

        console.log(req.userId);
        // Proceed to next middleware/route
        next();
    } catch (error) {
        console.error("Auth error:", error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: "Invalid token", 
                error: true, 
                success: false 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: "Token expired", 
                error: true, 
                success: false 
            });
        }

        res.status(500).json({ 
            message: "Internal server error", 
            error: true, 
            success: false 
        });
    }
}

export default auth;
