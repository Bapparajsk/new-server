import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'your_default_mongodb_uri';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connected Error: ${error}`);
        process.exit(1);
    }
};

export default connectDB;
