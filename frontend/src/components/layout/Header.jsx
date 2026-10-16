import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiHeart } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length >= 3) {
        try {
          const res = await api.get(`/products?keyword=${searchQuery}&limit=5`);
          setSuggestions(res.data.data.products);
          setShowSuggestions(true);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    
    const debounceTimeout = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      navigate(`/product/${suggestions[0]._id}`);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50 transition-all duration-300">
      {/* Top bar */}
      <div className="bg-primary text-white text-[11px] sm:text-xs py-1 px-3 sm:px-8 flex justify-between items-center">
        <p className="truncate mr-2">Free Delivery over ₹500!</p>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <select 
            className="bg-transparent border-none outline-none cursor-pointer text-[11px] sm:text-xs"
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            value={i18n.language}
          >
            <option value="en" className="text-black">English</option>
            <option value="hi" className="text-black">हिंदी</option>
          </select>
          <Link to="/track-order" className="hover:underline">Track Order</Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="px-3 sm:px-8 py-2.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
        {/* Logo */}
        <Link to="/" className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-1.5 sm:gap-2">
          <span className="bg-primary text-white p-1 rounded-md text-xs sm:text-sm font-black">G</span>
          FreshMart
        </Link>

        {/* Desktop Search Bar */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-2xl relative">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input 
              type="text" 
              placeholder={t('search')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              className="w-full border-2 border-gray-200 rounded-full py-2 px-6 pr-12 focus:outline-none focus:border-primary transition-colors"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
              <FiSearch size={20} />
            </button>
          </form>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <ul className="py-2">
                {suggestions.map((product) => (
                  <li key={product._id}>
                    <Link 
                      to={`/product/${product._id}`} 
                      onClick={() => { setShowSuggestions(false); setSearchQuery(''); }}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <img src={product.images[0]?.url || product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded-md" />
                      <div>
                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-primary font-bold">₹{product.price}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link to="/wishlist" className="text-gray-600 hover:text-accent transition-colors relative p-1">
            <FiHeart size={20} className="sm:w-6 sm:h-6" />
          </Link>
          
          <Link to="/cart" className="text-gray-600 hover:text-primary transition-colors relative flex items-center gap-2 p-1">
            <div className="relative">
              <FiShoppingCart size={20} className="sm:w-6 sm:h-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-accent text-white text-[9px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full font-bold">
                  {cartItems.length}
                </span>
              )}
            </div>
            <span className="hidden lg:block font-medium">Cart</span>
          </Link>

          <div className="h-6 sm:h-8 w-px bg-gray-200 hidden sm:block"></div>

          {user ? (
            <Link to={user.role === 'superadmin' ? "/admin" : "/dashboard"} className="flex items-center gap-2 text-gray-600 hover:text-primary">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                <FiUser size={15} className="sm:w-4 sm:h-4" />
              </div>
              <span className="hidden sm:block font-medium truncate max-w-[100px] text-sm">{user.name}</span>
            </Link>
          ) : (
            <Link to="/login" className="bg-primary text-white px-3.5 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-secondary transition-colors shadow-soft">
              {t('login')}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-3 pb-2.5 pt-0">
        <div className="relative">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input 
              type="text" 
              placeholder={t('search')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              className="w-full border border-gray-200 bg-gray-50 rounded-full py-1.5 px-4 pr-10 text-xs focus:outline-none focus:border-primary transition-colors"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
              <FiSearch size={16} />
            </button>
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-1.5 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <ul className="py-1">
                {suggestions.map((product) => (
                  <li key={product._id}>
                    <Link 
                      to={`/product/${product._id}`} 
                      onClick={() => { setShowSuggestions(false); setSearchQuery(''); }}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <img src={product.images[0]?.url || product.images[0]} alt={product.name} className="w-8 h-8 object-cover rounded-md" />
                      <div>
                        <p className="text-xs font-bold text-gray-800 line-clamp-1">{product.name}</p>
                        <p className="text-[11px] text-primary font-bold">₹{product.price}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
