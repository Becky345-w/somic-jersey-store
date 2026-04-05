import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';

export default function Wishlist() {
  const { wishlistItems } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-xl shadow-sm p-12 max-w-2xl mx-auto">
          <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty!</h2>
          <p className="text-gray-500 mb-8">Save your favorite jerseys here to buy them later.</p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-8 py-3 text-base font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors uppercase"
          >
            Discover Jerseys
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Wishlist ({wishlistItems.length})</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {wishlistItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
