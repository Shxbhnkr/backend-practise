import { asynchandler } from "../utils/asyncHandler.js";
import { Apierror } from "../utils/apierror.js";
import { user } from "../models/usermodel.js";
import { uploadoncloud } from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";



const genacessandrefresh=async(userid)=> {
    try {
        const auser=await user.findById(userid)
        const acctoken=auser.genaccesstoken()
        const reftoken=auser.genrefreshtoken()

        auser.refreshtoken=reftoken
        await auser.save({validateBeforeSave:false})

        return{reftoken,acctoken}

    } catch (error) {
        throw new Apierror(500,"error during generating acc and ref token") 
    }
}

const registeruser=asynchandler(async(req,res)=>{
    const{fullname,email,username,password}=req.body
    
    if ([fullname,email,username,password].some((field)=>field?.trim()==="")
    ) {
        throw new Apierror(400,"all field required");
        
    }

    const existuser= await user.findOne({
        $or: [{username},{email}]

    })
    if (existuser) {
        throw new Apierror(409,"user already exist") 
    }

    const avatarlocalpath=req.files?.avatar[0]?.path;
    const coverimagelocalpath=req.files?.coverimage[0]?.path;
    if (!avatarlocalpath) {
        throw new Apierror(400,"avatar file is required")
    }

    const avatar=await uploadoncloud(avatarlocalpath);
    const coverimage=await uploadoncloud(coverimagelocalpath);
    if (!avatar) {
        throw new Apierror(400,"avatar file is required")
    }

    const usercreate=await user.create({
        fullname,
        avatar:avatar.url,
        coverimage:coverimage?.url||"",
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
        new Apiresponse(200,createduser,"registeration success")
    )

})

const loginUser=asynchandler(async(req,res)=>{
    const{username,email,password}=req.body
    if (!(username||email)){
        throw new Apierror(400,"username or pass required");
        
    }
    const existuser= await user.findOne({
        $or : [{username},{email}]

    })
    if (!existuser) {
        throw new Apierror(409,"user does not already exist") 
    }

    const ispassvalid=await existuser.ispasswordcorrect(password)

    if (!ispassvalid) {
        throw new Apierror(401,"invalid credentials huhu") 
    }

    const {reftoken,acctoken}=await genacessandrefresh(existuser._id)

    const loginuser =await user.findById(existuser._id).select("-password -refreshtoken")

    const options={
        httpOnly:true,
        secure:true

    }

    return res.status(200).cookie("acctoken",acctoken,options).cookie("reftoken",reftoken,options).json(
        new Apiresponse(
            200,
            {
                user:loginuser,acctoken,reftoken
            },
            "user loggedin"
        )
    )
})

const logoutuser=asynchandler(async (req,res) => {
    await user.findByIdAndUpdate(
        req.buser._id,
        {
            $set:{
                refreshtoken:undefined
            }
        },
        {
            new:true

        }
    )


    const options={
        httpOnly:true,
        secure:true

    }


    return res.status(200).clearCookie("acctoken",options).clearCookie("reftoken",options).json(
        new Apiresponse(200,{},"user logged out")
    )
})

const refreshacctoken=asynchandler(async (req,res) => {
    const incomingrefreshtoken=req.cookies.reftoken||req.body.reftoken
    if (incomingrefreshtoken) {
        throw new Apierror(401,"unaouthorised request")
    }

    try {
        const decodedtoken=jwt.verify(
            incomingrefreshtoken,
            process.env.REFRESHTOKEN
        )
    
        const buser=await user.findById(decodedtoken?._id)
    
        if (!buser) {
            throw new Apierror(401,"invalid refr token")
        }
    
        if (incomingrefreshtoken!== buser?.refreshtoken) {
            throw new Apierror(403,"refresh token used")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accesstoken,newrefreshtoken}=await genacessandrefresh(buser._id)
    
        return res.status(200).cookie("accesstoken",accesstoken,options).cookie("refreshtoken",newrefreshtoken,options).json(
            new Apiresponse(
                200,
                {accesstoken,newrefreshtoken},
                "access token refreshed"
            )
        )
    } catch (error) {
        throw new Apierror(401,error?.message||"innvalid refresh token")
    }

})


export {
    registeruser,
    loginUser,
    logoutuser,
    refreshacctoken
}