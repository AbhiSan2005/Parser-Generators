import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${connect.connection.host}`);
    }
    catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
    }
};