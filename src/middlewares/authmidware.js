import {Apierror} from "../utils/apierror.js"
import jwt from "jsonwebtoken"
import {asynchandler} from "../utils/asyncHandler.js"
import { user } from "../models/usermodel.js";

export const verifyjwt=asynchandler(async (req,_,next) => {
    try {
        const token=req.cookies?.acctoken||req.header("authorisation")?.replace("Bearer ","")
        if (!token) {
            throw new Apierror(401,"unothorised req")
        }
    
        const decodedtoken=jwt.verify(token,process.env.ACCESSTOKEN)
    
        const buser=await user.findById(decodedtoken?._id).select("-password -refreshtoken")
    
        if (!buser) {
            throw new Apierror(401,"inv acc 2 token")
        }
    
        req.buser=buser;
        next()
    } 
    catch (error) {
        throw new Apierror(400,"inv acc3 token");
        
    }

})