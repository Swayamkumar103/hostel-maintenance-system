import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hostelfix";

    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
            console.log("DB is connected");
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}
