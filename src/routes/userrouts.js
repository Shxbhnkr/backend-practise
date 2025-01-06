import { Router } from "express";
import { loginUser,registeruser,logoutuser } from "../controllers/usercontroller.js";
import { upload } from "../middlewares/mutlermidware.js";
import {verifyjwt} from "../middlewares/authmidware.js"
import { refreshacctoken } from "../controllers/usercontroller.js";

const userrouter=Router()

userrouter.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxcount:1
        },
        {
            name:"coverimage",
            maxCount:1
        }
    ]),
    registeruser

)

userrouter.route("/login").post(loginUser)

userrouter.route("/logout").post(verifyjwt,logoutuser)

userrouter.route("/refresh-token").post(refreshacctoken)

userrouter.route("/change-password").post(verifyjwt, changecurrentpass)
userrouter.route("/current-user").get(verifyjwt, getcurruser)
userrouter.route("/update-account").patch(verifyjwt, updateaccdetails)

userrouter.route("/cover-image").patch(verifyjwt, upload.single("coverImage"), updateusercover)
userrouter.route("/avatar").patch(verifyjwt, upload.single("avatar"), updateuseravatar)

userrouter.route("/c/:username").get(verifyjwt, getUserChannelProfile)
userrouter.route("/history").get(verifyjwt, getWatchHistory)


export default userrouter   
