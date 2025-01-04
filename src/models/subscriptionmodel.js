import mongoose,{Schema} from "mongoose"
import { user } from "./usermodel"

const subscriptionschema=new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:user
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:user
    }
},{timestamps:true})