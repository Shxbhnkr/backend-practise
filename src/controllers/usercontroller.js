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
    if (!incomingrefreshtoken) {
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

const changecurrentpass=asynchandler(async (req,res) => {
    const {oldpass,newpass}=req.body
    const buser=await user.findById(req.buser?._id)
    const ispasswordcorrect=await buser.ispasswordcorrect(oldpass)
    if (!ispasswordcorrect) {
        throw new Apierror(400,"invalid old pass")
    }

    buser.password=newpass
    await buser.save({validateBeforeSave:false})

    return res.status(200).json(new Apiresponse(200,{},"password changed !"))

})

const getcurruser=asynchandler(async (req,res) => {
    return res.status(200).json(200,req.buser,"current user fetched !")
})

const updateaccdetails=asynchandler(async (req,res) => {
    const {fullname,email}=req.body
    if(!fullname || !email){
        throw new Apierror(400,"enter credentials")
    }
    const buser=await user.findByIdAndUpdate(
        req.buser?._id,
        {
            $set:{
                fullname,
                email, 
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200).json(new Apiresponse(200,buser,"account details updated !"))
})

const updateuseravatar=asynchandler(async (req,res) => {
    const avatarlocalpath=req.file?.path
    if (!avatarlocalpath) {
        throw new Apierror(400,"avatar file missing")
    }
    const avatar=await uploadoncloud(avatarlocalpath)
    if (!avatar.url) {
        throw new Apierror(400,"avatar link missing")
    }
    await user.findByIdAndUpdate(
        req.buser?._id,
        {
            $set:{
                avatar:avatar.url 
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new Apiresponse(200, buser, "Avatar image updated successfully")
    )


})

const updateusercover=asynchandler(async (req,res) => {
    const coverlocalpath=req.file?.path
    if (!coverlocalpath) {
        throw new Apierror(400,"cover file missing")
    }
    const coverimage=await uploadoncloud(coverlocalpath)
    if (!cover.url) {
        throw new Apierror(400,"coverimage link missing")
    }
    await user.findByIdAndUpdate(
        req.buser?._id,
        {
            $set:{
                coverimage:coverimage.url 
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new Apiresponse(200, buser, "Cover image updated successfully")
    )


})

const getUserChannelProfile = asynchandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new Apierror(400, "username is missing")
    }

    const channel = await user.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new Apierror(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new Apiresponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory = asynchandler(async(req, res) => {
    const user = await user.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new Apiresponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

export {
    registeruser,
    loginUser,
    logoutuser,
    refreshacctoken,
    changecurrentpass,
    getcurruser,
    updateaccdetails,
    updateuseravatar,
    updateusercover,
    getUserChannelProfile,
    getWatchHistory
}