/* eslint-disable no-return-await */
import mongoose, { Mongoose } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connect = async (): Promise<Mongoose> => await mongoose.connect(
  process.env.MONGO_URL2, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
);

export default connect;
