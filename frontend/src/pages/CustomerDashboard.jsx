import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyOrders } from '../redux/slices/orderSlice';
import { logoutUser, updateProfile } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { FiBox, FiUser, FiMapPin, FiLogOut } from 'react-icons/fi';

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError } = useSelector((state) => state.auth);
  const { myOrders, loading: orderLoading, error } = useSelector((state) => state.orders);

  const [activeTab, setActiveTab] = useState('profile');
  const [successMsg, setSuccessMsg] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    if (avatar) formData.append('avatar', avatar);

    const resultAction = await dispatch(updateProfile(formData));
    if (updateProfile.fulfilled.match(resultAction)) {
       setSuccessMsg('Profile saved successfully!');
       setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, user, navigate]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row gap-8 py-8 w-full max-w-7xl mx-auto">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col items-center">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover border-2 border-primary mb-4" />
          ) : (
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-bold mb-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-6 py-4 font-semibold transition-colors ${activeTab === 'orders' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FiBox size={20} /> My Orders
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-6 py-4 font-semibold transition-colors ${activeTab === 'profile' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FiUser size={20} /> Profile Info
          </button>
          <button 
            onClick={() => setActiveTab('address')}
            className={`w-full flex items-center gap-3 px-6 py-4 font-semibold transition-colors ${activeTab === 'address' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FiMapPin size={20} /> Addresses
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-4 font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            <FiLogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[500px]">
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Order History</h2>
              
              {orderLoading ? (
                <div className="text-center p-8">Loading orders...</div>
              ) : error ? (
                <div className="text-center p-8 bg-red-50 text-red-500 rounded-xl">{error}</div>
              ) : myOrders.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-2xl border border-gray-100">
                  <FiBox size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No orders found</h3>
                  <p className="text-gray-500 mb-6">Looks like you haven't placed an order yet.</p>
                  <button onClick={() => navigate('/')} className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-xl font-bold transition-colors">Start Shopping</button>
                </div>
              ) : (
                <div className="space-y-6">
                  {myOrders.map(order => (
                    <div key={order._id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Order ID</p>
                          <p className="font-bold text-gray-800 tracking-wider">#{order._id.substring(0, 10).toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Date</p>
                          <p className="font-bold text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Total</p>
                          <p className="font-bold text-gray-800 text-lg">₹{order.totalPrice}</p>
                        </div>
                        <div>
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                            order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {order.orderItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                            <img src={item.image || (item.images && item.images[0] ? item.images[0].url : 'https://via.placeholder.com/150')} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-white" />
                            <div>
                              <p className="font-bold text-sm text-gray-800 line-clamp-2">{item.name}</p>
                              <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity} &times; ₹{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Profile Information</h2>
              {authError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl font-medium">{authError}</div>}
              {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl font-medium">{successMsg}</div>}
              <form onSubmit={handleProfileUpdate} className="max-w-md space-y-6">
                
                <div className="flex flex-col items-center md:items-start gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <label className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-bold cursor-pointer hover:bg-gray-50 transition-colors">
                        Change Photo
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if(file){
                              setAvatar(file);
                              setAvatarPreview(URL.createObjectURL(file));
                            }
                          }} 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border-gray-300 rounded-xl p-3 bg-white focus:ring-primary focus:border-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <input type="email" value={user.email} className="w-full border-gray-300 rounded-xl p-3 bg-gray-50 text-gray-500 cursor-not-allowed" readOnly />
                  <p className="text-xs text-gray-400 mt-1">Email address cannot be changed.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border-gray-300 rounded-xl p-3 bg-white focus:ring-primary focus:border-primary" placeholder="Enter your phone number" />
                </div>
                
                <button type="submit" disabled={authLoading} className="w-full bg-primary hover:bg-secondary text-white font-bold py-4 rounded-xl mt-6 transition-colors premium-shadow disabled:opacity-50 disabled:cursor-not-allowed">
                  {authLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'address' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Saved Addresses</h2>
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-2xl text-center hover:bg-gray-50 cursor-pointer transition-colors">
                <FiMapPin size={32} className="mx-auto text-primary mb-2" />
                <p className="font-bold text-gray-700">Add New Address</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
