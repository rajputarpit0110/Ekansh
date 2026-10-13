import mongoose, { Schema } from 'mongoose';

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        image: {
            type: String,
            required: true
        },
        parentCategory: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parentCategory: 1 });

export const Category = mongoose.model('Category', categorySchema);
