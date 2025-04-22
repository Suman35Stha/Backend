import crypto from 'crypto';    
    
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
}

const generateRamdomOTP = () => {
    return Math.floor(Math.random() * 900000) + 100000 //100000 to 999999
}

export default generateOTP;