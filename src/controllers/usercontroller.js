import { asynchandler } from "../utils/asyncHandler.js";

const registeruser=asynchandler(async(req,res)=>{
    res.status(200).json({
        message:"hmm ok"
    })
})


export {registeruser}