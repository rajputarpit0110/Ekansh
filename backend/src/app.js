import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import morgan from 'morgan';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

app.use(mongoSanitize());
app.use(xss());

// Standard Middlewares
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes (to be imported later)
import authRouter from './routes/auth.routes.js';
import categoryRouter from './routes/category.routes.js';
import productRouter from './routes/product.routes.js';
import cartRouter from './routes/cart.routes.js';
import wishlistRouter from './routes/wishlist.routes.js';
import orderRouter from './routes/order.routes.js';
import couponRouter from './routes/coupon.routes.js';
import paymentRouter from './routes/payment.routes.js';
import reviewRouter from './routes/review.routes.js';
import bulkRouter from './routes/bulk.routes.js';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/coupons', couponRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bulk', bulkRouter);

app.get('/', (req, res) => {
    res.send('Grocery E-Commerce API is running...');
});

// Error Handling Middleware
app.use(errorHandler);

export { app };
