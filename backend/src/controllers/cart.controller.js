import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "name price images stock");
    
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    return res.status(200).json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    console.log("Cart update requested:", req.body);

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
        // Product exists in cart, update quantity
        cart.items[itemIndex].quantity += Number(quantity) || 1;
    } else {
        // Product does not exist in cart, add new item
        cart.items.push({ product: productId, quantity: Number(quantity) || 1 });
    }

    // Recalculate totals
    await cart.save();
    
    // re-fetch to populate
    cart = await Cart.findById(cart._id).populate("items.product", "name price images stock");
    
    return res.status(200).json(new ApiResponse(200, cart, "Item added to cart"));
});

const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    cart = await Cart.findById(cart._id).populate("items.product", "name price images stock");

    return res.status(200).json(new ApiResponse(200, cart, "Item removed from cart"));
});

const clearCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
        cart.items = [];
        await cart.save();
    }
    return res.status(200).json(new ApiResponse(200, cart, "Cart cleared successfully"));
});

export { getCart, addToCart, removeFromCart, clearCart };
