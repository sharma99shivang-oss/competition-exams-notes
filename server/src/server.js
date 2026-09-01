import 'dotenv/config';
import app from './app.js';
import {connectDB} from './config/db.js';

connectDB()
  .then(() => app.listen(process.env.PORT || 5000, () => console.log(`API on ${process.env.PORT || 5000}`)))
  .catch(err => { console.error(err); process.exit(1); });
// console.log("Razorpay Key:", process.env.RAZORPAY_KEY_ID);