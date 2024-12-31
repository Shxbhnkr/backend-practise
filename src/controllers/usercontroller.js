import { asynchandler } from "../utils/asyncHandler.js";
import { Apierror } from "../utils/apierror.js";
import { user } from "../models/usermodel.js";
import { uploadoncloud } from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/apiresponse.js";
import { response } from "express";

const registeruser=asynchandler(async(req,res)=>{
    const{username,email,avatar,coverimage}=req.body
    console.log("uname",username);
    
    if ([fullname,email,username,password].some((field)=>field?.trim()==="")
    ) {
        throw new Apierror(400,"all field required");
        
    }

    const exiteduser=user.findOne({
        $or: [{username},{email}]

    })
    if (exiteduser) {
        throw new Apierror(409,"user already exit") 
    }

    const avatarlocalpath=req.files?.avatar[0]?.path;
    const coverimagelocalpath=req.files?.coverimage[0]?.path;
    if (!avatarlocalpath) {
        throw new Apierror(400,"avatar file is required")
    }

    const avatr=await uploadoncloud(avatarlocalpath);
    const coverimg=await uploadoncloud(coverimagelocalpath);
    if (!avatr) {
        throw new Apierror(400,"avatar file is required")
    }

    const usercreate=await user.create({
        fullname,
        avatr:avatr.url,
        coverimg:coverimg?.url||"",
        email,
        password,
        username:username.toLowerCase()

    })

    const createduser=await user.findById(usercreate._id).select(
        "-password -refreshtoken"
    )

    if (!createduser) {
        throw new Apierror(500,"smthng went wrng while registrng user")
    }

    return res.status(201).json(
        new Apiresponse(200,"registeration success")
    )

})


export {registeruser}