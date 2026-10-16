import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiDollarSign, FiShoppingBag, FiXCircle, FiCalendar, FiSettings, FiActivity, FiBox } from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const STATUS_COLORS = {
  'Delivered': '#22c55e',
  'Pending': '#eab308',
  'Processing': '#3b82f6',
  'Shipped': '#6366f1',
  'Packed': '#a855f7',
  'Out For Delivery': '#14b8a6',
  'Cancelled': '#ef4444',
  'Refunded': '#6b7280'
};

const PAYMENT_COLORS = {
  'COD': '#f59e0b',
  'Card': '#8b5cf6',
  'UPI': '#0ea5e9'
};

const DEFAULT_WIDGETS = {
  cards: { revenue: true, orders: true, cancelled: true, aov: true, units: true },
  charts: { sales: true, status: true, products: true, payment: true }
};

const AnalyticsTab = () => {
  const { allOrders, loading } = useSelector((state) => state.orders);
  
  const [timeFilter, setTimeFilter] = useState('month'); // today, week, month, year, all, custom
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  const [showSettings, setShowSettings] = useState(false);
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);

  // Load preferences
  useEffect(() => {
    const saved = localStorage.getItem('adminAnalyticsWidgets');
    if (saved) {
      try { setWidgets(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Save preferences
  const handleWidgetToggle = (category, key) => {
    const newWidgets = { ...widgets, [category]: { ...widgets[category], [key]: !widgets[category][key] } };
    setWidgets(newWidgets);
    localStorage.setItem('adminAnalyticsWidgets', JSON.stringify(newWidgets));
  };

  const filteredData = useMemo(() => {
    if (!allOrders) return { orders: [], totalRevenue: 0, totalOrders: 0, cancelledOrders: 0, aov: 0, totalUnits: 0 };
    
    const now = new Date();
    let startDate = new Date(0);
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (timeFilter === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeFilter === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (timeFilter === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    } else if (timeFilter === 'year') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
    } else if (timeFilter === 'custom') {
      startDate = customStart ? new Date(customStart) : new Date(0);
      endDate = customEnd ? new Date(customEnd) : new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    const filtered = allOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= startDate && d <= endDate;
    });
    
    let totalRevenue = 0;
    let totalUnits = 0;
    
    filtered.forEach(o => {
      if (o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Refunded') {
        totalRevenue += o.totalPrice;
        o.orderItems?.forEach(item => {
          totalUnits += item.quantity || 0;
        });
      }
    });

    const totalOrders = filtered.length;
    const cancelledOrders = filtered.filter(o => o.orderStatus === 'Cancelled').length;
    const validOrdersCount = filtered.filter(o => o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Refunded').length;
    const aov = validOrdersCount > 0 ? (totalRevenue / validOrdersCount) : 0;

    return { orders: filtered, totalRevenue, totalOrders, cancelledOrders, aov, totalUnits };
  }, [allOrders, timeFilter, customStart, customEnd]);

  const chartData = useMemo(() => {
    const { orders } = filteredData;
    
    // Status Pie Chart
    const statusCounts = {};
    const paymentCounts = {};
    const productSales = {};
    const salesMap = {};

    const sortedOrders = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    sortedOrders.forEach(o => {
      // 1. Status
      statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] || 0) + 1;
      
      // Valid orders only for revenue/products
      if (o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Refunded') {
        // 2. Payment Methods
        paymentCounts[o.paymentMethod || 'COD'] = (paymentCounts[o.paymentMethod || 'COD'] || 0) + 1;
        
        // 3. Products
        o.orderItems?.forEach(item => {
          productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        });

        // 4. Sales Over Time
        const d = new Date(o.createdAt);
        let key = '';
        if (timeFilter === 'year' || timeFilter === 'all') {
          key = d.toLocaleDateString('default', { month: 'short', year: 'numeric' });
        } else {
          key = d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
        }
        salesMap[key] = (salesMap[key] || 0) + o.totalPrice;
      }
    });

    const pieData = Object.keys(statusCounts).map(k => ({ name: k, value: statusCounts[k] }));
    const paymentData = Object.keys(paymentCounts).map(k => ({ name: k, value: paymentCounts[k] }));
    
    const topProducts = Object.keys(productSales)
      .map(k => ({ name: k.length > 20 ? k.substring(0,20)+'...' : k, sold: productSales[k] }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5); // Top 5

    const barData = Object.keys(salesMap).map(k => ({ date: k, sales: salesMap[k] }));

    return { pieData, paymentData, topProducts, barData };
  }, [filteredData, timeFilter]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-800">Advanced Analytics</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">Customizable insights and business intelligence.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {timeFilter === 'custom' && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200 text-xs">
              <input type="date" value={customStart} onChange={(e)=>setCustomStart(e.target.value)} className="bg-transparent text-xs sm:text-sm focus:outline-none text-slate-600" />
              <span className="text-gray-400">to</span>
              <input type="date" value={customEnd} onChange={(e)=>setCustomEnd(e.target.value)} className="bg-transparent text-xs sm:text-sm focus:outline-none text-slate-600" />
            </div>
          )}

          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-gray-200 shadow-sm text-xs sm:text-sm">
            <FiCalendar className="text-primary text-xs sm:text-sm" />
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-slate-700 focus:outline-none"
            >
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
              <option value="year">Past 12 Months</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 sm:p-2.5 rounded-xl border transition-colors shadow-sm flex items-center justify-center ${showSettings ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
            >
              <FiSettings size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                <h4 className="font-bold text-slate-800 mb-3 text-xs sm:text-sm uppercase tracking-wider">Customize View</h4>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-[11px] sm:text-xs font-semibold text-gray-400 mb-2">METRIC CARDS</h5>
                    <div className="space-y-2">
                      {Object.keys(widgets.cards).map(key => (
                        <label key={key} className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 cursor-pointer">
                          <input type="checkbox" checked={widgets.cards[key]} onChange={() => handleWidgetToggle('cards', key)} className="rounded text-primary focus:ring-primary" />
                          <span className="capitalize">{key === 'aov' ? 'Average Order Value' : key}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-[11px] sm:text-xs font-semibold text-gray-400 mb-2">CHARTS</h5>
                    <div className="space-y-2">
                      {Object.keys(widgets.charts).map(key => (
                        <label key={key} className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 cursor-pointer">
                          <input type="checkbox" checked={widgets.charts[key]} onChange={() => handleWidgetToggle('charts', key)} className="rounded text-primary focus:ring-primary" />
                          <span className="capitalize">{key} Chart</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {widgets.cards.revenue && (
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 text-green-600 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-base"><FiDollarSign /></div>
              <p className="text-xs sm:text-sm font-semibold text-gray-500">Revenue</p>
            </div>
            <p className="text-base sm:text-2xl font-black text-slate-800">₹{filteredData.totalRevenue.toLocaleString()}</p>
          </div>
        )}
        {widgets.cards.orders && (
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 text-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-base"><FiShoppingBag /></div>
              <p className="text-xs sm:text-sm font-semibold text-gray-500">Orders</p>
            </div>
            <p className="text-base sm:text-2xl font-black text-slate-800">{filteredData.totalOrders}</p>
          </div>
        )}
        {widgets.cards.units && (
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 text-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-base"><FiBox /></div>
              <p className="text-xs sm:text-sm font-semibold text-gray-500">Units Sold</p>
            </div>
            <p className="text-base sm:text-2xl font-black text-slate-800">{filteredData.totalUnits}</p>
          </div>
        )}
        {widgets.cards.aov && (
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 text-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-base"><FiActivity /></div>
              <p className="text-xs sm:text-sm font-semibold text-gray-500">AOV</p>
            </div>
            <p className="text-base sm:text-2xl font-black text-slate-800">₹{filteredData.aov.toFixed(2)}</p>
          </div>
        )}
        {widgets.cards.cancelled && (
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 text-red-600 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-base"><FiXCircle /></div>
              <p className="text-xs sm:text-sm font-semibold text-gray-500">Cancelled</p>
            </div>
            <p className="text-base sm:text-2xl font-black text-slate-800">{filteredData.cancelledOrders}</p>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {widgets.charts.sales && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="text-base sm:text-xl font-bold text-slate-800 mb-3 sm:mb-6">Revenue Trend</h3>
            {chartData.barData.length > 0 ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `₹${value}`} />
                    <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="sales" fill="#14b8a6" radius={[6, 6, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-400">No revenue data for this period</div>
            )}
          </div>
        )}

        {widgets.charts.products && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-base sm:text-xl font-bold text-slate-800 mb-3 sm:mb-6">Top Products (Units Sold)</h3>
            {chartData.topProducts.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={chartData.topProducts} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12}} width={120} />
                    <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="sold" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">No product sales for this period</div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full lg:col-span-1">
          {widgets.charts.status && (
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">Order Status</h3>
              {chartData.pieData.length > 0 ? (
                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData.pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                        {chartData.pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || STATUS_COLORS['Pending']} />))}
                      </Pie>
                      <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No data</div>
              )}
            </div>
          )}

          {widgets.charts.payment && (
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">Payment Methods</h3>
              {chartData.paymentData.length > 0 ? (
                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData.paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                        {chartData.paymentData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PAYMENT_COLORS[entry.name] || '#94a3b8'} />))}
                      </Pie>
                      <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No data</div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AnalyticsTab;
