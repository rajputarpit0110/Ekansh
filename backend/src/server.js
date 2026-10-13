// Restarting to pick up new port 5001
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { app } from './app.js';
import { startKeepAlive } from './utils/keepAlive.js';

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`⚙️  Server is running at port : ${PORT}`);
            startKeepAlive();
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });
