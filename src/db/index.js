import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDB= async()=>{
    try{
        const connectInst=await mongoose.connect(`${process.env.MONGODB_URI}/${ DB_NAME}`);
        console.log(`\n Mongodb connected hooray! DB HOST: ${connectInst.connection.host}`);



    }
    catch(error){
         console.log("mongodb error",error);
         process.exit(1)
         
    }
}
export default connectDB