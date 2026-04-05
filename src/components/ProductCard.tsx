import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [added, setAdded] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      navigate('/login');
      return;
    }

    addToCart(product, 'M', 1); // Default size M for quick add
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to save items to your wishlist');
      navigate('/login');
      return;
    }

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full relative"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-100">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1580087433295-ab2600c1030e?q=80&w=1000&auto=format&fit=crop'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-800">
          {product.category}
        </div>
      </Link>
      
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleWishlist}
        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-10"
      >
        <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
      </motion.button>
      
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`} className="flex-grow">
          <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-black text-gray-900">
            ₦{product.price.toLocaleString()}
          </span>
        </div>
        
        <div className="mt-3 flex gap-2">
          <Link 
            to={`/product/${product.id}`}
            className="flex-1 py-2 rounded-md font-bold text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center justify-center border border-gray-200"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            VIEW
          </Link>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={product.in_stock === false || added}
            className={`flex-[1.5] py-2 rounded-md font-bold text-xs transition-colors flex items-center justify-center ${
              product.in_stock === false 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : added 
                  ? 'bg-green-600 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 mr-1" />
            {product.in_stock === false ? 'OUT' : added ? 'ADDED!' : 'ADD TO CART'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
