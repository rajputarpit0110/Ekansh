import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../redux/slices/orderSlice';
import { fetchProducts, deleteProductAPI } from '../redux/slices/productSlice';
import { logoutUser } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiUsers, FiShoppingBag, FiDollarSign, FiList, FiGrid, FiStar, FiSettings, FiLogOut, FiEdit2, FiX, FiTrash2, FiBarChart2 } from 'react-icons/fi';
import AnalyticsTab from '../components/admin/AnalyticsTab';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { allOrders, loading, error } = useSelector((state) => state.orders);

  const { items: allProducts, loading: productsLoading, totalPages } = useSelector((state) => state.products);
  const [activeTab, setActiveTab] = useState('overview');
  const [productPage, setProductPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', price: '', stock: '' });
  const [statusUpdates, setStatusUpdates] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user || user.role !== 'superadmin') {
      navigate('/');
    } else {
      if (activeTab === 'orders' || activeTab === 'overview') {
        dispatch(fetchAllOrders());
      }
      if (activeTab === 'products') {
        dispatch(fetchProducts(`page=${productPage}&limit=20`));
      }
    }
  }, [dispatch, user, navigate, activeTab, productPage]);

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    const { updateProductAPI } = await import('../redux/slices/productSlice');
    const formData = new FormData();
    if (newImage) formData.append('images', newImage);
    formData.append('name', editFormData.name);
    formData.append('price', editFormData.price);
    formData.append('stock', editFormData.stock);
    await dispatch(updateProductAPI({ id: editingProduct._id, formData }));
    setEditingProduct(null);
    setNewImage(null);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await dispatch(deleteProductAPI(id));
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    setStatusUpdates(prev => ({ ...prev, [orderId]: newStatus }));
  };

  const handleUpdateStatus = async (orderId) => {
    const status = statusUpdates[orderId];
    if (!status) return; // No change made
    setUpdatingOrderId(orderId);
    await dispatch(updateOrderStatus({ id: orderId, status }));
    setUpdatingOrderId(null);
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setIsUploadingCSV(true);
    setUploadMessage({ type: '', text: '' });
    try {
      const response = await api.post('/bulk/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { successCount, errors } = response.data.data;
      if (successCount > 0) {
        setUploadMessage({ type: 'success', text: `Success! ${successCount} products imported.` });
      } else {
        setUploadMessage({ type: 'error', text: `Failed to import. Error: ${errors?.[0] || 'Unknown error'}` });
      }
      dispatch(fetchProducts(`page=${productPage}&limit=20`));
      e.target.reset();
    } catch (error) {
      setUploadMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload CSV.' });
    } finally {
      setIsUploadingCSV(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'border-green-200 text-green-700 bg-green-50';
      case 'Cancelled': return 'border-red-200 text-red-700 bg-red-50';
      case 'Processing': return 'border-blue-200 text-blue-700 bg-blue-50';
      case 'Shipped': return 'border-indigo-200 text-indigo-700 bg-indigo-50';
      case 'Packed': return 'border-purple-200 text-purple-700 bg-purple-50';
      case 'Out For Delivery': return 'border-teal-200 text-teal-700 bg-teal-50';
      case 'Refunded': return 'border-gray-200 text-gray-700 bg-gray-50';
      default: return 'border-yellow-200 text-yellow-700 bg-yellow-50'; // Pending
    }
  };

  const totalRevenue = allOrders?.reduce((acc, order) => acc + order.totalPrice, 0) || 0;
  const pendingOrders = allOrders?.filter(o => o.orderStatus !== 'Delivered').length || 0;

  if (!user || user.role !== 'superadmin') return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      {/* Sidebar */}
      <div className="w-full md:w-72 shrink-0 mb-8 md:mb-0 md:mr-8">
        <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden text-slate-300 sticky top-8">
          <div className="p-6 border-b border-slate-800 text-center">
            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 shadow-lg shadow-primary/30">
              A
            </div>
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
            <p className="text-xs text-slate-400 mt-1">superadmin mode</p>
          </div>

          <div className="p-4 space-y-1">
            {[
              { id: 'overview', icon: FiGrid, label: 'Overview' },
              { id: 'analytics', icon: FiBarChart2, label: 'Analytics' },
              { id: 'orders', icon: FiShoppingBag, label: 'Orders' },
              { id: 'products', icon: FiList, label: 'Products' },
              { id: 'customers', icon: FiUsers, label: 'Customers' },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === item.id ? 'bg-primary text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
            
            <div className="my-4 border-t border-slate-800"></div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <FiLogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-slate-800">Dashboard Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: FiDollarSign, color: 'text-green-600', bg: 'bg-green-100' },
                { label: 'Total Orders', value: allOrders?.length || 0, icon: FiShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
                { label: 'Pending Orders', value: pendingOrders, icon: FiList, color: 'text-orange-600', bg: 'bg-orange-100' },
                { label: 'Total Users', value: '1,245', icon: FiUsers, color: 'text-purple-600', bg: 'bg-purple-100' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Recent Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-primary font-semibold hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm">
                      <th className="p-4 font-semibold">Order ID</th>
                      <th className="p-4 font-semibold">Customer</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Amount</th>
                      <th className="p-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading orders...</td></tr>
                    ) : allOrders?.slice(0, 5).map(order => (
                      <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-slate-800">#{order._id.substring(0,8)}</td>
                        <td className="p-4 text-gray-600">{order.user?.name || 'Guest'}</td>
                        <td className="p-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 font-bold text-slate-800">₹{order.totalPrice}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab />
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Manage Orders</h2>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm">
                      <th className="p-4 font-semibold">Order ID</th>
                      <th className="p-4 font-semibold">Customer</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Items</th>
                      <th className="p-4 font-semibold">Total</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="7" className="p-8 text-center text-gray-500">Loading all orders...</td></tr>
                    ) : allOrders?.map(order => (
                      <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-slate-800">#{order._id.substring(0,8).toUpperCase()}</td>
                        <td className="p-4 text-gray-600">
                          <div>{order.user?.name || 'Guest'}</div>
                          <div className="text-xs text-gray-400">{order.shippingAddress?.city}</div>
                        </td>
                        <td className="p-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-gray-600">{order.orderItems.length} items</td>
                        <td className="p-4 font-bold text-slate-800">₹{order.totalPrice}</td>
                        <td className="p-4">
                          <select 
                            value={statusUpdates[order._id] || order.orderStatus}
                            onChange={(e) => setStatusUpdates({...statusUpdates, [order._id]: e.target.value})}
                            className={`px-3 py-1 rounded-lg text-sm font-bold border-2 focus:ring-0 ${getStatusColor(statusUpdates[order._id] || order.orderStatus)}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out For Delivery">Out For Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Refunded">Refunded</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleUpdateStatus(order._id)}
                            disabled={updatingOrderId === order._id || !statusUpdates[order._id] || statusUpdates[order._id] === order.orderStatus}
                            className={`font-bold text-sm transition-colors ${
                              updatingOrderId === order._id ? 'text-gray-400' :
                              !statusUpdates[order._id] || statusUpdates[order._id] === order.orderStatus ? 'text-gray-300' : 'text-primary hover:text-secondary'
                            }`}
                          >
                            {updatingOrderId === order._id ? 'Updating...' : 'Update'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Products Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-700 mb-4">Bulk Import (CSV/Excel)</h3>
                <p className="text-gray-500 mb-6 text-sm">Upload a CSV or Excel file to instantly create hundreds of products.</p>
                <form onSubmit={handleBulkUpload} encType="multipart/form-data" className="space-y-4">
                  <input type="file" name="file" accept=".csv, .xlsx" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" required />
                  <button type="submit" disabled={isUploadingCSV} className={`px-6 py-2 rounded-xl font-bold transition-colors shadow-md w-full ${isUploadingCSV ? 'bg-primary/60 text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-secondary'}`}>
                    {isUploadingCSV ? 'Uploading...' : 'Upload Products'}
                  </button>
                  {uploadMessage.text && (
                    <div className={`p-3 rounded-lg text-sm font-semibold mt-2 ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {uploadMessage.text}
                    </div>
                  )}
                </form>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <a href="http://localhost:5002/api/v1/bulk/products/export" className="text-primary hover:underline font-medium text-sm">Download Existing Products (CSV)</a>
                </div>
                <iframe name="dummyframe" id="dummyframe" style={{ display: 'none' }}></iframe>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-700 mb-4">Bulk Image Upload</h3>
                <p className="text-gray-500 mb-6 text-sm">Select multiple images to upload directly to Cloudinary. They will be auto-optimized to WebP.</p>
                <form action="http://localhost:5002/api/v1/bulk/images/upload" method="POST" encType="multipart/form-data" target="dummyframe" className="space-y-4">
                  <input type="file" name="images" accept="image/*" multiple className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" required />
                  <button type="submit" className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-md w-full">Upload Images</button>
                </form>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <h3 className="text-xl font-bold text-gray-700 mb-4">All Products</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm">
                      <th className="p-4 font-semibold">Image</th>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">SKU</th>
                      <th className="p-4 font-semibold">Price</th>
                      <th className="p-4 font-semibold">Stock</th>
                      <th className="p-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsLoading ? (
                      <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading products...</td></tr>
                    ) : allProducts?.map(product => (
                      <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <img src={product.images[0]?.url} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                        </td>
                        <td className="p-4 font-medium text-slate-800">{product.name}</td>
                        <td className="p-4 text-gray-600 text-xs">{product.sku}</td>
                        <td className="p-4 font-bold text-slate-800">₹{product.price}</td>
                        <td className="p-4 text-gray-600">{product.stock}</td>
                        <td className="p-4 text-right flex items-center justify-end gap-3 h-full pt-6">
                          <button 
                            onClick={() => {
                              setEditingProduct(product);
                              setEditFormData({ name: product.name, price: product.price, stock: product.stock });
                            }}
                            className="text-primary hover:text-secondary font-bold text-sm flex items-center gap-1"
                          >
                            <FiEdit2 /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-500 hover:text-red-600 font-bold text-sm flex items-center gap-1"
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-100 mt-4">
                  <button 
                    disabled={productPage === 1}
                    onClick={() => setProductPage(prev => Math.max(prev - 1, 1))}
                    className="px-4 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-gray-600">Page {productPage} of {totalPages}</span>
                  <button 
                    disabled={productPage === totalPages}
                    onClick={() => setProductPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-4 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {editingProduct && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-bold text-slate-800">Edit Product</h3>
                    <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-red-500 transition-colors"><FiX size={24} /></button>
                  </div>
                  <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                      <input 
                        type="text" 
                        value={editFormData.name} 
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:ring-0 focus:border-primary" 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                        <input 
                          type="number" 
                          value={editFormData.price} 
                          onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                          className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:ring-0 focus:border-primary" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                        <input 
                          type="number" 
                          value={editFormData.stock} 
                          onChange={(e) => setEditFormData({...editFormData, stock: e.target.value})}
                          className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:ring-0 focus:border-primary" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Update Image (Optional)</label>
                      <img src={editingProduct.images[0]?.url} alt="Current" className="w-full h-32 object-cover rounded-xl border border-gray-200 mb-2" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setNewImage(e.target.files[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
                      />
                    </div>
                    <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-secondary transition-colors shadow-md mt-4">Save Changes</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Customers Management</h3>
            <p className="text-gray-500">This module is part of the extended admin features.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
