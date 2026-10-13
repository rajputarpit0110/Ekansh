import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import slugify from "slugify";

const createCategory = asyncHandler(async (req, res) => {
    const { name, parentCategory } = req.body;

    if (!name) {
        throw new ApiError(400, "Category name is required");
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        throw new ApiError(400, "Category already exists");
    }

    const imageLocalPath = req.file?.path;
    if (!imageLocalPath) {
        throw new ApiError(400, "Category image is required");
    }

    const image = await uploadOnCloudinary(imageLocalPath);
    if (!image) {
        throw new ApiError(500, "Failed to upload image");
    }

    const category = await Category.create({
        name,
        slug: slugify(name, { lower: true }),
        image: image.url,
        parentCategory: parentCategory || null
    });

    return res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
});

const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({}).populate('parentCategory', 'name slug');
    return res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, isActive, parentCategory } = req.body;

    let category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    if (name) {
        category.name = name;
        category.slug = slugify(name, { lower: true });
    }
    if (isActive !== undefined) category.isActive = isActive;
    if (parentCategory !== undefined) category.parentCategory = parentCategory;

    if (req.file) {
        const image = await uploadOnCloudinary(req.file.path);
        if (image) {
            category.image = image.url;
        }
    }

    await category.save();

    return res.status(200).json(new ApiResponse(200, category, "Category updated successfully"));
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }
    return res.status(200).json(new ApiResponse(200, {}, "Category deleted successfully"));
});

export { createCategory, getAllCategories, updateCategory, deleteCategory };
