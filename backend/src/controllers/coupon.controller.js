import { Coupon } from "../models/coupon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createCoupon = asyncHandler(async (req, res) => {
    const { code, discountType, discountValue, minOrderValue, maxDiscountAmount, expiryDate, usageLimit } = req.body;

    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
        throw new ApiError(400, "Coupon with this code already exists");
    }

    const coupon = await Coupon.create({
        code, discountType, discountValue, minOrderValue, maxDiscountAmount, expiryDate, usageLimit
    });

    return res.status(201).json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

const validateCoupon = asyncHandler(async (req, res) => {
    const { code, orderValue } = req.body;

    const coupon = await Coupon.findOne({ code, isActive: true });

    if (!coupon) {
        throw new ApiError(404, "Invalid or expired coupon");
    }

    if (new Date(coupon.expiryDate) < new Date()) {
        throw new ApiError(400, "Coupon has expired");
    }

    if (coupon.usedCount >= coupon.usageLimit) {
        throw new ApiError(400, "Coupon usage limit reached");
    }

    if (orderValue < coupon.minOrderValue) {
        throw new ApiError(400, `Minimum order value for this coupon is ${coupon.minOrderValue}`);
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
        discount = (orderValue * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
        }
    } else {
        discount = coupon.discountValue;
    }

    return res.status(200).json(new ApiResponse(200, { discount, couponId: coupon._id }, "Coupon applied successfully"));
});

const getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({});
    return res.status(200).json(new ApiResponse(200, coupons, "Coupons fetched successfully"));
});

export { createCoupon, validateCoupon, getAllCoupons };
