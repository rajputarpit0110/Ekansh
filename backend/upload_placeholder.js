import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
cloudinary.uploader.upload('/Users/arpitrajput/.gemini/antigravity-ide/brain/da225656-5780-4804-813a-84e59156c777/premium_packaging_placeholder_1780177008823.png', { folder: 'products' })
  .then(res => console.log('URL:', res.secure_url))
  .catch(err => console.error(err));
