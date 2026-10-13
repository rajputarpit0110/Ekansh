import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <Header />

      <main className="flex-grow w-full">
        <Routes>
          <Route path="/" element={<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full"><Home /></div>} />
          <Route path="/product/:id" element={<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full"><ProductDetails /></div>} />
          <Route path="/cart" element={<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full"><Cart /></div>} />
          <Route path="/checkout" element={<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full"><Checkout /></div>} />
          <Route path="/login" element={<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full"><Login /></div>} />
          <Route path="/dashboard" element={<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full"><CustomerDashboard /></div>} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
