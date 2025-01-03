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

export default userrouter   
