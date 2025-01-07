import mongoose, { Schema } from "mongoose";
const tweetschema=new Schema({
    owner:{
        type: Schema.Types.ObjectId,
        ref:"user"
      
    },
    content:{
        type: String,
        required:true,
      
    }
},{timestamps:true})

export const tweet=mongoose.model("tweet",tweetschema)