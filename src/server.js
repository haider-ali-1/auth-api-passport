import 'dotenv/config.js';
import { app } from './app.js';
import mongoose from 'mongoose';

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('connected with mongodb');
    console.log(`server is running at http:localhost:${port}`);
  } catch (error) {
    console.log(error);
  }
});
