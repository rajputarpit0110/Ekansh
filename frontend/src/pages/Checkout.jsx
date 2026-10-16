import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveShippingAddress, savePaymentMethod, clearCart } from '../redux/slices/cartSlice';
import { createOrder, resetOrder } from '../redux/slices/orderSlice';
import { FiCheckCircle, FiTruck, FiCreditCard } from 'react-icons/fi';
import api from '../services/api';

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, shippingAddress, paymentMethod } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const { success, loading, error, order } = useSelector(state => state.orders);

  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    fullName: shippingAddress.fullName || '',
    phone: shippingAddress.phone || '',
    address: shippingAddress.address || '',
    city: shippingAddress.city || '',
    state: shippingAddress.state || '',
    pincode: shippingAddress.pincode || ''
  });
  const [payment, setPayment] = useState(paymentMethod || 'COD');

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice > 500 ? 0 : 50;
  const taxPrice = Number((0.05 * itemsPrice).toFixed(2));
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (success && order) {
      dispatch(clearCart());
      dispatch(resetOrder());
      navigate(`/dashboard`);
    }
  }, [success, order, navigate, dispatch]);

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress(address));
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(payment));
    setStep(3);
  };

  const placeOrderHandler = async () => {
    const orderDataToSubmit = {
      orderItems: cartItems.map(item => ({
        product: item.product || item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image?.url || item.image || (item.images && item.images[0] ? item.images[0].url : 'https://via.placeholder.com/150')
      })),
      shippingAddress: address,
      paymentMethod: payment,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    };

    if (payment === 'UPI') {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }
      try {
        const { data: keyData } = await api.get('/payments/razorpay/key');
        const { data: orderData } = await api.post('/payments/razorpay/process', { amount: totalPrice });
        
        const options = {
          key: keyData.data.key,
          amount: orderData.data.amount,
          currency: "INR",
          name: "TopNotchProducts",
          description: "TopNotchProducts Order Payment",
          order_id: orderData.data.id,
          handler: function (response) {
             dispatch(createOrder({
                ...orderDataToSubmit,
                isPaid: true,
                paymentResult: {
                  id: response.razorpay_payment_id,
                  status: 'success',
                  update_time: new Date().toISOString()
                }
             }));
          },
          prefill: {
              name: address.fullName,
              email: user.email,
              contact: address.phone
          },
          theme: {
              color: "#10b981"
          }
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (error) {
        console.error("Razorpay Error:", error);
        alert(error.response?.data?.message || "Something went wrong with Razorpay payment setup.");
      }
    } else {
      dispatch(createOrder(orderDataToSubmit));
    }
  };

  if (cartItems.length === 0) {
    return <div className="p-12 text-center text-xl font-bold">Your cart is empty. <br/><button onClick={() => navigate('/')} className="mt-4 text-primary">Go Shopping</button></div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {/* Progress Bar */}
      <div className="flex justify-between items-center mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 transition-all" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
        
        {['Address', 'Payment', 'Review'].map((label, idx) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${step > idx ? 'bg-primary border-primary text-white' : step === idx + 1 ? 'bg-white border-primary text-primary' : 'bg-white border-gray-300 text-gray-400'}`}>
              {step > idx + 1 ? <FiCheckCircle size={20} /> : idx + 1}
            </div>
            <span className={`text-sm font-bold ${step >= idx + 1 ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><FiTruck className="text-primary"/> Shipping Address</h2>
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input type="text" required value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="w-full border-gray-300 rounded-xl p-3 focus:ring-primary focus:border-primary bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" required value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full border-gray-300 rounded-xl p-3 focus:ring-primary focus:border-primary bg-gray-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Address / Street</label>
                  <input type="text" required value={address.address} onChange={e => setAddress({...address, address: e.target.value})} className="w-full border-gray-300 rounded-xl p-3 focus:ring-primary focus:border-primary bg-gray-50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                    <input type="text" required value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full border-gray-300 rounded-xl p-3 focus:ring-primary focus:border-primary bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                    <input type="text" required value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full border-gray-300 rounded-xl p-3 focus:ring-primary focus:border-primary bg-gray-50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode</label>
                    <input type="text" required value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="w-full border-gray-300 rounded-xl p-3 focus:ring-primary focus:border-primary bg-gray-50" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-bold py-4 rounded-xl mt-4 transition-colors">Continue to Payment</button>
              </form>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><FiCreditCard className="text-primary"/> Payment Method</h2>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="radio" name="payment" value="Card" checked={payment === 'Card'} onChange={e => setPayment(e.target.value)} className="w-5 h-5 text-primary focus:ring-primary" />
                  <span className="font-semibold">Credit/Debit Card (Stripe)</span>
                </label>
                <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="radio" name="payment" value="UPI" checked={payment === 'UPI'} onChange={e => setPayment(e.target.value)} className="w-5 h-5 text-primary focus:ring-primary" />
                  <span className="font-semibold">UPI / Netbanking (Razorpay)</span>
                </label>
                <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="radio" name="payment" value="COD" checked={payment === 'COD'} onChange={e => setPayment(e.target.value)} className="w-5 h-5 text-primary focus:ring-primary" />
                  <span className="font-semibold">Cash on Delivery (COD)</span>
                </label>
                <div className="flex gap-4 mt-8">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-colors">Back</button>
                  <button type="submit" className="flex-1 bg-primary hover:bg-secondary text-white font-bold py-4 rounded-xl transition-colors">Review Order</button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>
              
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-700 mb-2">Shipping To:</h3>
                <p className="text-gray-600">{address.fullName} - {address.phone}</p>
                <p className="text-gray-600">{address.address}, {address.city}, {address.state} - {address.pincode}</p>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-700 mb-2">Payment Method:</h3>
                <p className="text-gray-600 font-medium">{payment}</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-700 mb-4">Items:</h3>
                <div className="space-y-4">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img src={item.image?.url || item.image || (item.images && item.images[0] ? item.images[0].url : 'https://via.placeholder.com/150')} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div className="mt-6 bg-red-50 text-red-500 p-4 rounded-xl font-medium">{error}</div>}

              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setStep(2)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-colors">Back</button>
                <button type="button" onClick={placeOrderHandler} disabled={loading} className="flex-[2] bg-primary hover:bg-secondary text-white font-bold py-4 rounded-xl transition-colors premium-shadow disabled:opacity-50">
                  {loading ? 'Processing...' : 'Place Order & Pay'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 sticky top-4">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
            <div className="space-y-3 text-gray-600 mb-6">
              <div className="flex justify-between"><span>Items</span> <span>₹{itemsPrice}</span></div>
              <div className="flex justify-between"><span>Shipping</span> <span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice}`}</span></div>
              <div className="flex justify-between"><span>Tax (5%)</span> <span>₹{taxPrice}</span></div>
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-gray-800">Total</span>
              <span className="text-2xl font-bold text-primary">₹{totalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
