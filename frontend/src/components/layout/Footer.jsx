import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-8 sm:pt-16 pb-6 sm:pb-8 mt-6 sm:mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <div>
          <Link to="/" className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mb-3 sm:mb-6">
            <span className="bg-primary text-white p-1 rounded-md text-xs sm:text-sm">G</span>
            FreshMart
          </Link>
          <p className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 text-gray-400">
            Your one-stop destination for fresh groceries, daily essentials, and household items. Delivered fresh to your doorstep.
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold text-base sm:text-lg mb-2 sm:mb-4">Quick Links</h3>
          <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link to="/offers" className="hover:text-primary transition-colors">Special Offers</Link></li>
            <li><Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold text-base sm:text-lg mb-2 sm:mb-4">Customer Policies</h3>
          <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link to="/return" className="hover:text-primary transition-colors">Return Policy</Link></li>
            <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping Info</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold text-base sm:text-lg mb-2 sm:mb-4">Contact Info</h3>
          <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
            <li>123 Grocery Street, Food City, 456789</li>
            <li>Phone: +91 98765 43210</li>
            <li>Email: support@freshmart.com</li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 sm:mt-12 pt-4 sm:pt-8 border-t border-gray-800 text-xs sm:text-sm text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} FreshMart Grocery E-Commerce. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
