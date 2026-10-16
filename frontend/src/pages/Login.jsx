import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../redux/slices/authSlice';

const Login = () => {
  const [email, setEmail] = useState('test@freshmart.com');
  const [password, setPassword] = useState('password123');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useSelector(state => state.auth);

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="max-w-md mx-auto mt-4 sm:mt-12 bg-white p-5 sm:p-8 rounded-2xl shadow-soft border border-gray-100">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center text-gray-800">Welcome Back</h2>
      
      {error && <div className="bg-red-50 text-red-500 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 text-xs sm:text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full border border-gray-300 p-2.5 sm:p-3 text-sm rounded-xl focus:ring-primary focus:border-primary bg-gray-50 outline-none transition-colors" 
            required 
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full border border-gray-300 p-2.5 sm:p-3 text-sm rounded-xl focus:ring-primary focus:border-primary bg-gray-50 outline-none transition-colors" 
            required 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-primary text-white py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-secondary transition-colors premium-shadow disabled:opacity-50 mt-2 sm:mt-4"
        >
          {loading ? 'Logging in...' : 'Login to Continue'}
        </button>
      </form>
      <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500">
        Using demo credentials: test@freshmart.com / password123
      </div>
    </div>
  );
};

export default Login;
