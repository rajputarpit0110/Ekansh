import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
console.log('API_KEY:', process.env.CLOUDINARY_API_KEY);
