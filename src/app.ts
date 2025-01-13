import 'dotenv/config'
import express, {Express} from 'express';
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './config/db.config';

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 8000;

connectDB();
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));


app.listen(PORT, () => {
  console.log(`Server is running on port http://127.0.0.1:${PORT}`);
});
