import { Router } from "express";
import { registeruser } from "../controllers/usercontroller.js";
import { upload } from "../middlewares/mutlermidware.js";

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

export default userrouter   
