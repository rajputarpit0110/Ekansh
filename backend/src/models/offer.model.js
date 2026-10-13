import mongoose, { Schema } from 'mongoose';

const offerSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    offerType: { 
        type: String, 
        enum: ['Flash Sale', 'Daily Deal', 'Weekly Deal', 'Festival Deal', 'Category Discount', 'Brand Discount', 'BOGO', 'Combo'], 
        required: true 
    },
    discountPercentage: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    bannerImage: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Offer = mongoose.model('Offer', offerSchema);
