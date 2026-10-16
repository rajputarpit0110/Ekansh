import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiHeart, FiShare2, FiTruck, FiShield, FiArrowLeft } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  const { productDetails: product, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProductDetails(id));
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0]?.url,
        quantity
      }));
      // Optional: Show toast notification here
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) return <div className="p-12 text-center text-xl font-bold text-gray-500">Loading product details...</div>;
  if (error) return <div className="p-12 text-center text-red-500 bg-red-50 rounded-xl m-8">{error}</div>;
  if (!product) return null;

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="w-full">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-primary font-bold mb-3 sm:mb-6 text-xs sm:text-base transition-colors">
        <FiArrowLeft /> Back to products
      </button>

      <div className="bg-white p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-3xl shadow-sm mb-6 sm:mb-12 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3 sm:space-y-4">
            <div className="w-full aspect-square bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 p-4 sm:p-8 flex items-center justify-center relative">
              {discount > 0 && (
                <span className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 bg-accent text-white px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-bold rounded-md">{discount}% OFF</span>
              )}
              <img src={product.images[0]?.url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-lg" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <div key={idx} className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 rounded-xl border-2 border-primary overflow-hidden p-1.5 sm:p-2 bg-gray-50 cursor-pointer">
                    <img src={img} alt="" className="w-full h-full object-cover rounded-md" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="text-xs sm:text-sm text-primary mb-1 sm:mb-2 font-bold tracking-wider uppercase">{product.brand}</div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-2 sm:mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
              <div className="flex items-center bg-green-100 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md text-primary font-bold text-xs sm:text-sm">
                <span>{product.rating || 4.5}</span>
                <FiStar className="ml-1 fill-primary" />
              </div>
              <span className="text-xs sm:text-sm text-gray-500 font-medium underline cursor-pointer">{product.numReviews || 0} Ratings & Reviews</span>
              <span className="text-gray-300">|</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-600">Weight: {product.weight}</span>
            </div>

            <div className="flex items-end gap-2.5 sm:gap-4 mb-4 sm:mb-8">
              <span className="text-2xl sm:text-4xl font-bold text-gray-900">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-base sm:text-xl text-gray-400 line-through mb-0.5 sm:mb-1">₹{product.originalPrice}</span>
              )}
              <span className="text-xs sm:text-sm text-green-600 font-bold mb-0.5 sm:mb-1">(Inclusive of all taxes)</span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8 flex-wrap">
              <span className="font-semibold text-gray-700 text-xs sm:text-sm">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-200 transition-colors font-bold text-base sm:text-lg text-gray-600">-</button>
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 font-bold w-10 sm:w-14 text-center bg-white border-x border-gray-300 text-xs sm:text-base">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-200 transition-colors font-bold text-base sm:text-lg text-gray-600">+</button>
              </div>
              <span className="text-xs sm:text-sm font-medium text-orange-500">
                {product.stock < 10 ? `Only ${product.stock} left in stock!` : 'In Stock'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 mb-6 sm:mb-10">
              <button onClick={handleAddToCart} className="flex-1 bg-white border-2 border-primary text-primary hover:bg-green-50 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all">
                <FiShoppingCart size={18} /> Add to Cart
              </button>
              <button onClick={handleBuyNow} className="flex-1 bg-primary hover:bg-secondary text-white py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 premium-shadow transition-all">
                Buy Now
              </button>
              <button className="h-11 sm:h-14 sm:w-14 shrink-0 bg-gray-50 border border-gray-200 hover:border-red-500 hover:text-red-500 text-gray-400 rounded-xl flex items-center justify-center transition-all">
                <FiHeart size={20} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-4 sm:py-6 border-y border-gray-100 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-green-50 p-3 rounded-full text-primary"><FiTruck size={24} /></div>
                <div>
                  <p className="font-semibold text-sm">Superfast Delivery</p>
                  <p className="text-xs text-gray-500">In 10 minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-blue-50 p-3 rounded-full text-blue-500"><FiShield size={24} /></div>
                <div>
                  <p className="font-semibold text-sm">100% Secure Payment</p>
                  <p className="text-xs text-gray-500">Multiple Options</p>
                </div>
              </div>
            </div>
            
            {/* Details Tabs */}
            <div>
              <div className="flex gap-8 border-b border-gray-200 mb-6">
                {['description', 'additional info'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 font-bold capitalize transition-all ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="text-gray-600 text-sm leading-relaxed min-h-[100px]">
                {activeTab === 'description' && <p>{product.description}</p>}
                {activeTab === 'additional info' && (
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>SKU:</strong> {product.sku}</li>
                    <li><strong>Category:</strong> {product.category?.name || 'General'}</li>
                    <li><strong>Returns:</strong> No returns for perishable items unless damaged.</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
