import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
import { response } from 'express';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARYNAME,
    api_key: process.env.CLOUDINARYKEY, 
    api_secret: process.env.CLOUDINARYSECRET 
});

const uploadoncloud=async function(localfpath) {
        try {
            if (!localfpath) {
                return null
            }
            const response=await cloudinary.uploader.upload(localfpath,{
                resource_type:"auto"
            })
            
            fs.unlinkSync(localfpath)
            return response;
            
        } catch (error) {
            fs.unlink(localfpath)
            return null;
        }
}



export {uploadoncloud}


