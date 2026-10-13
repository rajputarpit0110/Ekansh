import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

let isConfigured = false;

const configureCloudinary = () => {
    if (!isConfigured) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        isConfigured = true;
    }
};

const uploadOnCloudinary = async (localFilePath) => {
    try {
        configureCloudinary();
        if (!localFilePath) return null;
        // Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "grocery_ecommerce",
            format: "webp",
            fetch_format: "auto",
            quality: "auto",
            width: 1200,
            height: 1200,
            crop: "limit"
        });
        // File has been uploaded successfully
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } catch (e) {
            console.error("Failed to delete temp file:", e);
        }
        return response;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath); 
            }
        } catch (e) {
            console.error("Failed to delete temp file:", e);
        }
        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        configureCloudinary();
        if (!publicId) return null;
        const response = await cloudinary.uploader.destroy(publicId);
        return response;
    } catch (error) {
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
