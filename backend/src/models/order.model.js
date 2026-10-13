import mongoose, { Schema } from 'mongoose';

const orderItemSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
    price: { type: Number, required: true }
});

const orderSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        orderItems: [orderItemSchema],
        shippingAddress: {
            fullName: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            phone: { type: String, required: true }
        },
        paymentMethod: { type: String, required: true, enum: ['COD', 'Card', 'UPI'] },
        paymentResult: {
            id: { type: String },
            status: { type: String },
            update_time: { type: String },
            email_address: { type: String }
        },
        itemsPrice: { type: Number, required: true, default: 0.0 },
        taxPrice: { type: Number, required: true, default: 0.0 },
        shippingPrice: { type: Number, required: true, default: 0.0 },
        totalPrice: { type: Number, required: true, default: 0.0 },
        isPaid: { type: Boolean, required: true, default: false },
        paidAt: { type: Date },
        orderStatus: { 
            type: String, 
            required: true, 
            default: 'Pending',
            enum: ['Pending', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Refunded']
        },
        deliveredAt: { type: Date }
    },
    { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
