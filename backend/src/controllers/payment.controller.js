import Stripe from "stripe";
import Razorpay from "razorpay";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Lazy initialize SDKs to avoid ES Module hoisting crashing the app when .env isn't loaded yet
const getStripe = () => {
    return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
};

const getRazorpay = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
    });
};

const processStripePayment = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    
    if (!amount) throw new ApiError(400, "Amount is required");

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amounts in cents
        currency: "inr",
        metadata: { integration_check: "accept_a_payment" }
    });

    return res.status(200).json(new ApiResponse(200, { client_secret: paymentIntent.client_secret }, "Stripe intent created"));
});

const processRazorpayPayment = asyncHandler(async (req, res) => {
    const { amount } = req.body;

    if (!amount) throw new ApiError(400, "Amount is required");

    const razorpay = getRazorpay();
    const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`
    };

    try {
        const order = await razorpay.orders.create(options);

        if (!order) {
            throw new ApiError(500, "Failed to create Razorpay order");
        }

        return res.status(200).json(new ApiResponse(200, order, "Razorpay order created"));
    } catch (error) {
        console.error("Razorpay Create Order Error:", error);
        throw new ApiError(500, error.error ? error.error.description : "Failed to create Razorpay order");
    }
});

const getRazorpayKey = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, { key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy' }, "Razorpay key fetched"));
});

export { processStripePayment, processRazorpayPayment, getRazorpayKey };
