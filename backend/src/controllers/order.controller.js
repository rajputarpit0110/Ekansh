import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const placeOrder = asyncHandler(async (req, res) => {
    const { shippingAddress, paymentMethod, paymentResult, isPaid } = req.body;

    if (!shippingAddress || !paymentMethod) {
        throw new ApiError(400, "Shipping address and payment method are required");
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Your cart is empty");
    }

    // Check stock and calculate price
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
        const product = await Product.findById(item.product._id);
        if (product.stock < item.quantity) {
            throw new ApiError(400, `Product ${product.name} is out of stock`);
        }
        
        itemsPrice += product.price * item.quantity;
        orderItems.push({
            product: product._id,
            name: product.name,
            quantity: item.quantity,
            image: product.images[0],
            price: product.price
        });
        
        // Decrement stock
        product.stock -= item.quantity;
        await product.save();
    }

    // Default calculations (can be configured in settings later)
    const taxPrice = itemsPrice * 0.18; // 18% GST example
    const shippingPrice = itemsPrice > 500 ? 0 : 50; // free shipping over 500
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    const order = await Order.create({
        user: req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        paymentResult,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: isPaid || false,
        paidAt: isPaid ? Date.now() : undefined
    });

    // Clear cart after placing order
    cart.items = [];
    await cart.save();

    return res.status(201).json(new ApiResponse(201, order, "Order placed successfully"));
});

const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Verify ownership or admin
    if (order.user._id.toString() !== req.user._id.toString() && !['admin', 'superadmin'].includes(req.user.role)) {
        throw new ApiError(403, "Not authorized to view this order");
    }

    return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    order.orderStatus = status;
    if (status === 'Delivered') {
        order.deliveredAt = Date.now();
        order.isPaid = true;
        order.paidAt = Date.now();
    }

    await order.save();

    return res.status(200).json(new ApiResponse(200, order, "Order status updated"));
});

const getAllOrdersAdmin = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice;
    });

    return res.status(200).json(new ApiResponse(200, { orders, totalAmount }, "All orders fetched successfully"));
});

export { placeOrder, getMyOrders, getOrderById, updateOrderStatus, getAllOrdersAdmin };
