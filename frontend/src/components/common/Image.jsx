import React, { useState, useEffect } from 'react';

const Image = ({ src, alt, className, width, height, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Example of using srcset for Cloudinary URLs if the src comes from cloudinary
  // If src contains 'res.cloudinary.com', we can inject auto formatting
  const getOptimizedSrc = (url) => {
    if (!url) return 'https://via.placeholder.com/300?text=No+Image';
    if (url.includes('res.cloudinary.com')) {
      // already optimized if we passed correct upload params, but we can enforce f_auto,q_auto
      if (!url.includes('f_auto')) {
        return url.replace('/upload/', '/upload/f_auto,q_auto/');
      }
    }
    return url;
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <span className="text-gray-300">Loading...</span>
        </div>
      )}
      <img
        src={error ? 'https://via.placeholder.com/300?text=Error' : getOptimizedSrc(src)}
        alt={alt || "Product image"}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => { setIsLoaded(true); setError(true); }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        {...props}
      />
    </div>
  );
};

export default Image;
