import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const addReview = asyncHandler(async (req, res) => {
    const { rating, comment, productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
        throw new ApiError(400, "Product already reviewed");
    }

    let imageUrls = [];
    if (req.files && req.files.images) {
        for (const file of req.files.images) {
            const image = await uploadOnCloudinary(file.path);
            if (image) imageUrls.push(image.url);
        }
    }

    const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
        images: imageUrls,
        isApproved: false // Admin must approve
    };

    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    return res.status(201).json(new ApiResponse(201, product, "Review added successfully, pending approval"));
});

const approveReview = asyncHandler(async (req, res) => {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    review.isApproved = true;
    await product.save();

    return res.status(200).json(new ApiResponse(200, product, "Review approved successfully"));
});

const getApprovedReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const reviews = product.reviews.filter(r => r.isApproved === true);
    return res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
});

export { addReview, approveReview, getApprovedReviews };
