import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Menu, Shirt, Search, User, X, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

import { motion } from 'motion/react';

export default function Navbar() {
  const { itemCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      {/* Top banner */}
      <div className="bg-blue-600 text-white text-xs font-medium py-1.5 overflow-hidden">
        <div className="animate-marquee">
          Nationwide Waybill Available! Order Authentic Jerseys Today.
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4 md:gap-8">
          {/* Logo and Links */}
          <div className="flex items-center shrink-0 gap-8">
            <Link to="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative h-16 w-auto sm:h-20"
              >
                <img 
                  src="/logo.png" 
                  alt="Somic's Jersey Store" 
                  className="h-full w-auto object-contain"
                  onError={(e) => {
                    // Fallback if logo.png is not found
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1580087433295-ab2600c1030e?q=80&w=100&auto=format&fit=crop';
                  }}
                />
              </motion.div>
            </Link>
            
            <div className="hidden lg:flex items-center gap-6">
              <Link to="/" className="text-gray-700 font-bold uppercase tracking-tight hover:text-blue-600 transition-colors">Home</Link>
              <a href="/#categories" className="text-gray-700 font-bold uppercase tracking-tight hover:text-blue-600 transition-colors">Categories</a>
              <Link to="/track-order" className="text-gray-700 font-bold uppercase tracking-tight hover:text-blue-600 transition-colors">Track Order</Link>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex-grow max-w-2xl hidden md:block">
            <form onSubmit={handleSearch} className="relative flex items-center w-full">
              <Search className="absolute left-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jerseys, teams, categories..."
                className="w-full pl-10 pr-24 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              <button 
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-r-md transition-colors"
              >
                SEARCH
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-6 shrink-0">
            <Link to={user ? "/account" : "/login"} className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
              <User className="h-6 w-6" />
              <span className="hidden lg:block">{user ? (user.user_metadata.full_name || user.email?.split('@')[0]) : 'Login'}</span>
            </Link>

            <Link to="/wishlist" className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors relative p-2">
              <div className="relative">
                <Heart className="h-6 w-6" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <span className="hidden lg:block font-medium">Wishlist</span>
            </Link>

            <Link to="/cart" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors relative p-2">
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:block font-medium">Cart</span>
            </Link>
            
            <button 
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className={`pb-3 md:hidden ${isMobileMenuOpen ? 'hidden' : 'block'}`}>
          <form onSubmit={handleSearch} className="relative flex items-center w-full">
            <Search className="absolute left-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jerseys..."
              className="w-full pl-10 pr-20 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600"
            />
            <button 
              type="submit"
              className="absolute right-0 top-0 bottom-0 px-4 bg-blue-600 text-white font-bold rounded-r-md"
            >
              SEARCH
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4 shadow-lg absolute w-full left-0 transition-all duration-300 ease-in-out origin-top ${isMobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
        <Link 
          to="/" 
          className="block text-gray-700 font-bold uppercase tracking-tight hover:text-blue-600 py-2"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Home
        </Link>
        <a 
          href="/#categories" 
          className="block text-gray-700 font-bold uppercase tracking-tight hover:text-blue-600 py-2"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Categories
        </a>
        <Link 
          to="/track-order" 
          className="block text-gray-700 font-bold uppercase tracking-tight hover:text-blue-600 py-2"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Track Order
        </Link>
        <Link 
          to="/wishlist" 
          className="block text-gray-700 font-medium hover:text-blue-600 flex items-center gap-2 py-2"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Heart className="h-5 w-5" /> Wishlist ({wishlistItems.length})
        </Link>
        <Link 
          to={user ? "/account" : "/login"} 
          className="block text-gray-700 font-medium hover:text-blue-600 flex items-center gap-2 py-2"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <User className="h-5 w-5" /> {user ? 'Account' : 'Login'}
        </Link>
      </div>
    </nav>
  );
}
