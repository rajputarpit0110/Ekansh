import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import slugify from "slugify";
import mongoose from "mongoose";
import { Category } from "../models/category.model.js";

const createProduct = asyncHandler(async (req, res) => {
    const { name, description, sku, category, price, stock, weight, packSize, brand, nutritionalInfo, ingredients, returnPolicy } = req.body;

    if (!name || !description || !sku || !category || !price || !stock) {
        throw new ApiError(400, "Required fields are missing");
    }

    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
        throw new ApiError(400, "Product with this SKU already exists");
    }

    let imageUrls = [];
    if (req.files && req.files.images) {
        for (const file of req.files.images) {
            const image = await uploadOnCloudinary(file.path);
            if (image) imageUrls.push({ publicId: image.public_id, url: image.secure_url });
        }
    }

    if (imageUrls.length === 0) {
        throw new ApiError(400, "At least one product image is required");
    }

    let videoUrl = null;
    if (req.files && req.files.video) {
        const video = await uploadOnCloudinary(req.files.video[0].path);
        if (video) videoUrl = video.url;
    }

    const product = await Product.create({
        name,
        slug: slugify(name, { lower: true }),
        description,
        sku,
        category,
        images: imageUrls,
        video: videoUrl,
        price,
        stock,
        weight,
        packSize,
        brand,
        nutritionalInfo,
        ingredients,
        returnPolicy
    });

    return res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
    // Advanced search, filtering, and pagination
    const { keyword, category, minPrice, maxPrice, sort, page, limit } = req.query;

    let query = {};
    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { brand: { $regex: keyword, $options: 'i' } }
        ];
    }
    if (category) {
        if (!mongoose.Types.ObjectId.isValid(category)) {
            const cat = await Category.findOne({ slug: category.toLowerCase() });
            if (cat) {
                query.category = cat._id;
            } else {
                query.category = "000000000000000000000000"; // return nothing if not found
            }
        } else {
            query.category = category;
        }
    }
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortQuery = {};
    if (sort === "lowest") sortQuery.price = 1;
    else if (sort === "highest") sortQuery.price = -1;
    else if (sort === "toprated") sortQuery.ratings = -1;
    else sortQuery.createdAt = -1; // newest by default

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
        .populate("category", "name")
        .sort(sortQuery)
        .skip(skip)
        .limit(pageSize);

    return res.status(200).json(new ApiResponse(200, {
        products,
        page: pageNumber,
        pages: Math.ceil(count / pageSize),
        total: count
    }, "Products fetched successfully"));
});

const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate("category", "name");
    if (!product) {
        throw new ApiError(404, "Product not found");
    }
    return res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (req.body.name) {
        req.body.slug = slugify(req.body.name, { lower: true });
    }

    if (req.files && req.files.images) {
        // Replace existing images
        if (product.images && product.images.length > 0) {
            for (const img of product.images) {
                if (img.publicId && !img.publicId.startsWith('dummy')) {
                    await deleteFromCloudinary(img.publicId).catch(() => {});
                }
            }
        }
        
        let newImageUrls = [];
        for (const file of req.files.images) {
            const image = await uploadOnCloudinary(file.path);
            if (image) newImageUrls.push({ publicId: image.public_id, url: image.secure_url });
        }
        req.body.images = newImageUrls;
    }

    if (req.files && req.files.video) {
        const video = await uploadOnCloudinary(req.files.video[0].path);
        if (video) req.body.video = video.url;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    return res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Delete images from cloudinary
    if (product.images && product.images.length > 0) {
        for (const img of product.images) {
            if (img.publicId) await deleteFromCloudinary(img.publicId);
        }
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json(new ApiResponse(200, {}, "Product deleted successfully"));
});

export { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct };
