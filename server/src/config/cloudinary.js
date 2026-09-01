import {v2 as cloudinary} from 'cloudinary';
const placeholders=new Set(['','your_api_key','your_cloud_name','your_api_secret']);
export const cloudinaryEnabled=[process.env.CLOUDINARY_CLOUD_NAME,process.env.CLOUDINARY_API_KEY,process.env.CLOUDINARY_API_SECRET].every(v=>v&&!placeholders.has(String(v).trim().toLowerCase()));
if(cloudinaryEnabled)cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET,secure:true});
export default cloudinary;
