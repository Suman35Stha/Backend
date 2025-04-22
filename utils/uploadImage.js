import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const uploadImage = async (image) => {
    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    // Multer provides the file in a specific format with a path property
    const buffer = image.buffer || Buffer.from(image.path);

    // Upload the image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({
            folder: process.env.CLOUDINARY_FOLDER,
            resource_type: 'auto',
        }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        }).end(buffer);
    });

    return uploadResult;
};

export default uploadImage;