import fs from 'fs';
import csvParser from 'csv-parser';
import * as xlsx from 'xlsx';
import { format } from 'fast-csv';
import { Product } from '../models/product.model.js';
import { Category } from '../models/category.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import slugify from 'slugify';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

const parseExcel = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet);
};

export const importProducts = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Please upload a CSV or Excel file");
    }

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    let productsData = [];

    if (ext === 'csv') {
        productsData = await parseCSV(req.file.path);
    } else if (ext === 'xlsx' || ext === 'xls') {
        productsData = parseExcel(req.file.path);
    } else {
        throw new ApiError(400, "Unsupported file format. Please upload CSV or Excel.");
    }

    // Process and insert
    let successCount = 0;
    let errors = [];

    for (const item of productsData) {
        try {
            // Find category
            let category = null;
            if (item.Category) {
                category = await Category.findOne({ slug: slugify(item.Category, { lower: true }) });
                if (!category) {
                    category = await Category.create({
                        name: item.Category,
                        slug: slugify(item.Category, { lower: true }),
                        image: "https://via.placeholder.com/200" // placeholder for category image
                    });
                }
            }

            const sku = item.SKU || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            await Product.create({
                name: item.Name,
                slug: slugify(item.Name, { lower: true }) + '-' + Math.floor(Math.random()*1000),
                description: item.Description || item.Name,
                sku,
                category: category ? category._id : null,
                price: Number(item.Price) || 0,
                discountPrice: Number(item.DiscountPrice) || 0,
                stock: Number(item.Stock) || 0,
                brand: item.Brand,
                weight: item.Weight,
                images: item.Images ? item.Images.split(',').map(url => ({ publicId: 'bulk_upload', url: url.trim() })) : []
            });
            successCount++;
        } catch (error) {
            errors.push(`Row error for ${item.Name}: ${error.message}`);
        }
    }

    fs.unlinkSync(req.file.path);

    return res.status(200).json(new ApiResponse(200, { successCount, errors }, "Bulk import completed"));
});

export const exportProducts = asyncHandler(async (req, res) => {
    const products = await Product.find().populate('category', 'name').lean();
    
    const formattedData = products.map(p => ({
        Name: p.name,
        Description: p.description,
        SKU: p.sku,
        Category: p.category ? p.category.name : '',
        Price: p.price,
        DiscountPrice: p.discountPrice,
        Stock: p.stock,
        Brand: p.brand,
        Weight: p.weight,
        Images: p.images.map(img => img.url).join(',')
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');

    const csvStream = format({ headers: true });
    csvStream.pipe(res);
    formattedData.forEach(row => csvStream.write(row));
    csvStream.end();
});

export const bulkImageUpload = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "Please upload at least one image");
    }

    const uploadedImages = [];
    for (const file of req.files) {
        const image = await uploadOnCloudinary(file.path);
        if (image) {
            uploadedImages.push({ publicId: image.public_id, url: image.secure_url });
        }
    }

    return res.status(200).json(new ApiResponse(200, uploadedImages, "Bulk images uploaded successfully"));
});
