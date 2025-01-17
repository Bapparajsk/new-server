import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'your_default_mongodb_uri';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);

    } catch (error) {
        console.error(`MongoDB Connected Error: ${error}`);
        process.exit(1);
    }
};

connectDB().then(() => {
    console.log(`MongoDB Connected Successfully 🚀`);
}).catch(error => {
    console.error(`MongoDB Connection Error: ${error}`);
    process.exit(1);
});

