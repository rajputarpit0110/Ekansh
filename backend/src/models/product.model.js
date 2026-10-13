import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [{ type: String }],
    isApproved: { type: Boolean, default: false }
}, { timestamps: true });

const productSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String, required: true },
        sku: { type: String, required: true, unique: true },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        subcategory: { type: Schema.Types.ObjectId, ref: 'Category' },
        images: [{ 
            publicId: { type: String, required: true },
            url: { type: String, required: true }
        }],
        video: { type: String },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        stock: { type: Number, required: true, min: 0 },
        weight: { type: String }, // e.g., "500g", "1kg"
        packSize: { type: String },
        brand: { type: String },
        nutritionalInfo: { type: String },
        ingredients: { type: String },
        returnPolicy: { type: String },
        codAvailable: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
        ratings: { type: Number, default: 0 },
        numOfReviews: { type: Number, default: 0 },
        reviews: [reviewSchema]
    },
    { timestamps: true }
);

// Indexes for performance and search
productSchema.index({ name: 'text', description: 'text', brand: 'text' }, { weights: { name: 10, brand: 5, description: 1 } });
productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ brand: 1 });

export const Product = mongoose.model('Product', productSchema);
