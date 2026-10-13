import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
            <span className="bg-primary text-white p-1 rounded-md">G</span>
            FreshMart
          </Link>
          <p className="text-sm leading-relaxed mb-6">
            Your one-stop destination for fresh groceries, daily essentials, and household items. Delivered fresh to your doorstep.
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link to="/offers" className="hover:text-primary transition-colors">Special Offers</Link></li>
            <li><Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold text-lg mb-4">Customer Policies</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link to="/return" className="hover:text-primary transition-colors">Return Policy</Link></li>
            <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping Info</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold text-lg mb-4">Contact Info</h3>
          <ul className="space-y-3 text-sm">
            <li>123 Grocery Street, Food City, 456789</li>
            <li>Phone: +91 98765 43210</li>
            <li>Email: support@freshmart.com</li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-center">
        <p>&copy; {new Date().getFullYear()} FreshMart Grocery E-Commerce. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
