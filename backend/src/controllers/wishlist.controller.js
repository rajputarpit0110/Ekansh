import { Wishlist } from "../models/wishlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getWishlist = asyncHandler(async (req, res) => {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products", "name price images ratings");
    
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    
    return res.status(200).json(new ApiResponse(200, wishlist, "Wishlist fetched successfully"));
});

const toggleWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.findIndex(id => id.toString() === productId);

    if (index > -1) {
        // Remove from wishlist
        wishlist.products.splice(index, 1);
    } else {
        // Add to wishlist
        wishlist.products.push(productId);
    }

    await wishlist.save();
    wishlist = await Wishlist.findById(wishlist._id).populate("products", "name price images ratings");

    return res.status(200).json(new ApiResponse(200, wishlist, "Wishlist updated"));
});

export { getWishlist, toggleWishlist };
