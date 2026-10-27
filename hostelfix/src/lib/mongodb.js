// import mongoose from "mongoose";

// const MONGODB_URL = process.env.MONGODB_URL;

// async function connectDB() {
//     try {
//         if (!MONGODB_URL) {
//             throw new Error("MONGODB_URL is missing in .env.local");
//         }
//         const a = 5;
//         await mongoose.connect(MONGODB_URL);

//         console.log("Database connected successfully");

//     } catch (error) {
//         console.error("Database connection failed:", error.message);
//         console.log(error);

//         throw error;
//     }
// }

// export default connectDB;

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if(!MONGODB_URI){
    throw new Error("MONGODB_URI not defined");
}
export default async function connectDB(){
    await mongoose.connect(MONGODB_URI);
    console.log("DB is connected");
    
}