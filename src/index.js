import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {app} from "../src/app.js"
dotenv.config({
    path:'./env'
})


connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.error("errr:",error)
        throw error
    })
    app.listen(process.env.PORT|| 5000,()=>{
        console.log(`app is listening on port ${process.env.PORT}`);
        
    })
})
.catch((error)=>{
    console.log("mongodb connection failed !!",error)
    
}
)















/* tried an approach..might correct it later

import mongoose from "mongoose";

import { DB_NAME } from "./constants.js";




import express from "express";
const app =express()

(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.error("errr:",error)
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`ap port:${process.env.PORT}`);
            
        })
    }
    catch (error) {
        console.error("ERROR2:",error)
        process.exit(1)
    }
})()

*/

    