import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
import { response } from 'express';
import fs from "fs"


const uploadoncloud=async function(localfpath) {
        try {
            if (!localfpath) {
                return null
            }
            const response=await cloudinary.uploader.upload(localfpath,{
                resource_type:"auto"
            })
            console.log("file uploaded",response.url);
            return response;
            
        } catch (error) {
            fs.unlink(localfpath)
            return null;
        }
}


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARYNAME,
    api_key: process.env.CLOUDINARYKEY, 
    api_secret: process.env.CLOUDINARYSECRET 
});

export {uploadoncloud}


