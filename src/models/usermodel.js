import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userschema= new Schema(
    {
        username:{
            type: String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type: String,
            required:true,
            unique:true, 
            lowercase:true,
            trim:true,
            
        },
        fullname:{
            type: String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,
            required:true
        },
        coverimage:{
            type:String
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"video"
            }
        ],
        password:{
            type:String,
            required:[true,'required field']
        },
        refreshtoken:{
            type:String
        }

        
    },{
        timestamps:true
    }
)

userschema.pre("save",async function(next) {
    if (this.isModified("password")) {
        this.password=await bcrypt.hash(this.password,10)
    next()
    }
    
})
userschema.methods.ispasswordcorrect=async function (password) {
    return await bcrypt.compare(password,this.password)
}

userschema.methods.genaccesstoken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESSTOKEN,
        {
            expiresIn:process.env.ACCESSTOKENEXPIRY
        }
    )

}
userschema.methods.genrefreshtoken=function(){
    return jwt.sign(
        {
            _id:this._id,
           
        },
        process.env.REFRESHTOKEN,
        {   
            expiresIn:process.env.REFRESHTOKENEXPIRY
        }
    )
}

const user= mongoose.model("user",userschema)

export {user}