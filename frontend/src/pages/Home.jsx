import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';

const Home = () => {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    let query = 'limit=10';
    if (selectedCategory) {
      query += `&category=${selectedCategory}`;
    }
    dispatch(fetchProducts(query));
  }, [dispatch, selectedCategory]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1
    }));
  };

  return (
    <div className="w-full">
      {/* Hero Banner Section */}
      <section className="w-full h-[400px] md:h-[500px] bg-gradient-to-r from-green-50 to-green-100 rounded-3xl overflow-hidden relative mt-4 shadow-soft mb-12 flex items-center px-8 md:px-16">
        <div className="max-w-xl relative z-10">
          <span className="bg-accent text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4 inline-block">FRESH ARRIVALS</span>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 leading-tight mb-4">
            Fresh Groceries <br/> <span className="text-primary">Delivered Fast!</span>
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Get up to 50% off on your first order. Shop fresh vegetables, fruits, and daily essentials.
          </p>
          <button className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-full font-semibold transition-all premium-shadow flex items-center gap-2">
            Shop Now
          </button>
        </div>
        <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20 md:opacity-100 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center mix-blend-multiply rounded-l-full">
        </div>
      </section>

      {/* Categories Navigation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Categories</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[
            { name: 'Vegetables', img: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=200' },
            { name: 'Fruits', img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200' },
            { name: 'Rice', img: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=200' },
            { name: 'Spices', img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200' },
            { name: 'Snacks', img: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200' },
            { name: 'Dairy', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200' }
          ].map((cat, i) => {
            const slug = cat.name.toLowerCase();
            const isSelected = selectedCategory === slug;
            return (
              <div 
                key={i} 
                onClick={() => setSelectedCategory(isSelected ? null : slug)}
                className="min-w-[120px] flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div className={`w-24 h-24 rounded-full shadow-soft group-hover:shadow-lg transition-all overflow-hidden flex items-center justify-center border-4 ${isSelected ? 'border-primary' : 'border-transparent group-hover:border-primary/50'}`}>
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <span className={`text-sm font-bold text-center transition-colors ${isSelected ? 'text-primary' : 'text-gray-700 group-hover:text-primary'}`}>{cat.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold">{selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products` : 'Trending Products'}</h2>
          <button className="text-primary font-medium hover:underline">View All</button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">Loading products...</div>
        ) : error ? (
          <div className="text-red-500 p-8 text-center bg-red-50 rounded-xl">{error}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map(product => {
              const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
              
              return (
                <div key={product._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-soft hover:shadow-lg transition-all group cursor-pointer flex flex-col h-full">
                  <Link to={`/product/${product._id}`} className="block flex-1">
                    <div className="aspect-square bg-gray-50 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center p-4">
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded">{discount}% OFF</span>
                      )}
                      <img src={product.images[0]?.url} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <p className="text-xs text-gray-500 mb-1 font-semibold tracking-wider">{product.brand}</p>
                    <h3 className="font-bold text-gray-800 line-clamp-2 mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-xs text-gray-400 mb-2">{product.weight}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold text-slate-900">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                  </Link>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full py-2.5 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-colors mt-auto"
                  >
                    Add to Cart
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
