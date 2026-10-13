import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';
import { removeFromCart, addToCart } from '../redux/slices/cartSlice';

const Cart = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [itemToDelete, setItemToDelete] = useState(null);

  const handleQuantity = (item, qty) => {
    dispatch(addToCart({ ...item, quantity: qty }));
  };

  const confirmRemove = (id) => {
    setItemToDelete(id);
  };

  const handleRemove = () => {
    if (itemToDelete) {
      dispatch(removeFromCart(itemToDelete));
      setItemToDelete(null);
    }
  };

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxPrice = itemsPrice * 0.18;
  const shippingPrice = itemsPrice > 500 ? 0 : 50;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <FiShoppingCart size={64} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Let's fix that!</p>
        <Link to="/" className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-full font-bold premium-shadow transition-all">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="flex-1 space-y-6">
          {cartItems.map((item) => (
            <div key={item.product} className="bg-white p-4 sm:p-6 rounded-2xl shadow-soft border border-gray-100 flex flex-col sm:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
              <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                <img src={item.image?.url || item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <Link to={`/product/${item.product}`} className="font-bold text-lg text-gray-800 hover:text-primary transition-colors line-clamp-1 mb-1">
                  {item.name}
                </Link>
                <p className="text-primary font-bold text-lg mb-4 sm:mb-0">₹{item.price}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <button onClick={() => item.quantity > 1 ? handleQuantity(item, -1) : confirmRemove(item.product)} className="px-3 py-1 hover:bg-gray-200 transition-colors text-gray-600"><FiMinus /></button>
                  <span className="px-4 py-1 font-bold bg-white text-gray-800 w-12 text-center">{item.quantity}</span>
                  <button onClick={() => handleQuantity(item, 1)} className="px-3 py-1 hover:bg-gray-200 transition-colors text-gray-600"><FiPlus /></button>
                </div>
                
                <button onClick={() => confirmRemove(item.product)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-3 rounded-full transition-all">
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Items ({cartItems.reduce((a, c) => a + c.quantity, 0)}):</span>
                <span>₹{itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Tax (18% GST):</span>
                <span>₹{taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Shipping:</span>
                <span className={shippingPrice === 0 ? "text-green-500 font-bold" : ""}>
                  {shippingPrice === 0 ? "FREE" : `₹${shippingPrice.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-gray-800">Grand Total</span>
                <span className="text-3xl font-bold text-primary">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={() => navigate('/checkout')} className="w-full bg-primary hover:bg-secondary text-white py-4 rounded-xl font-bold text-lg premium-shadow transition-all">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 text-center transform transition-all">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="text-red-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Remove Item?</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to remove this item from your cart?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-secondary transition-colors shadow-md order-1 sm:order-2"
              >
                No, Keep it
              </button>
              <button 
                onClick={handleRemove}
                className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors order-2 sm:order-1"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
