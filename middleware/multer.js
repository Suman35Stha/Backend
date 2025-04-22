import multer from "multer";

// Configure multer storage
const storage = multer.memoryStorage();

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// Export the upload middleware
export default upload;
