import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, mockProducts, Product, Review } from '../lib/supabase';
import { ArrowLeft, Truck, ShieldCheck, ShoppingBag, Loader2, Star, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [mainImage, setMainImage] = useState<string>('');
  
  // Customization state
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  
  // Review state
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', user_name: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      
      if (!supabase) {
        const found = mockProducts.find(p => p.id === id);
        setProduct(found || null);
        if (found) {
          setMainImage(found.image_url);
          if (found.sizes && found.sizes.length > 0) setSelectedSize(found.sizes[0]);
          if (found.colors && found.colors.length > 0) setSelectedColor(found.colors[0]);
        }
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Fetch reviews separately if using Supabase, but for now we'll just use the mock logic
          // or assume reviews are part of the product object if we set it up that way.
          setProduct({ ...data, reviews: [] });
          setMainImage(data.image_url);
          if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
          if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
        } else {
          // Fallback to mock
          const found = mockProducts.find(p => p.id === id);
          setProduct(found || null);
          if (found) {
            setMainImage(found.image_url);
            if (found.sizes && found.sizes.length > 0) setSelectedSize(found.sizes[0]);
            if (found.colors && found.colors.length > 0) setSelectedColor(found.colors[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        const found = mockProducts.find(p => p.id === id);
        setProduct(found || null);
        if (found) setMainImage(found.image_url);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const [added, setAdded] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const customizationCost = isCustomizing ? (customName.length + customNumber.length) * 500 : 0;

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      navigate('/login');
      return;
    }

    if (product) {
      addToCart(
        { ...product, colors: product.colors, sizes: product.sizes }, 
        selectedSize, 
        quantity, 
        isCustomizing ? customName : '', 
        isCustomizing ? customNumber : '', 
        customizationCost,
        selectedColor
      );
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to write a review');
      navigate('/login');
      return;
    }

    if (!newReview.user_name || !newReview.comment) return;
    
    setIsSubmittingReview(true);
    
    // Mock review submission
    setTimeout(() => {
      const review: Review = {
        id: Date.now().toString(),
        user_name: newReview.user_name,
        rating: newReview.rating,
        comment: newReview.comment,
        created_at: new Date().toISOString()
      };
      
      if (product) {
        setProduct({
          ...product,
          reviews: [review, ...(product.reviews || [])]
        });
      }
      
      setNewReview({ rating: 5, comment: '', user_name: '' });
      setIsSubmittingReview(false);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <p className="text-gray-500 mb-8">The jersey you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="text-blue-600 font-medium hover:underline inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 mb-8 transition-colors uppercase tracking-tight">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to categories
      </Link>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="bg-gray-50 p-8 flex flex-col items-center justify-center">
            <motion.img 
              key={mainImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={mainImage || product.image_url} 
              alt={product.name} 
              className="w-full max-w-md object-contain mix-blend-multiply mb-6"
              referrerPolicy="no-referrer"
            />
            {product.additional_images && product.additional_images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto py-2 px-2 w-full max-w-md justify-center">
                <button 
                  onClick={() => setMainImage(product.image_url)}
                  className={`w-16 h-16 shrink-0 rounded-md border-2 overflow-hidden transition-colors ${mainImage === product.image_url ? 'border-blue-600' : 'border-transparent hover:border-blue-300'}`}
                >
                  <img src={product.image_url} alt="Main" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
                {product.additional_images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`w-16 h-16 shrink-0 rounded-md border-2 overflow-hidden transition-colors ${mainImage === img ? 'border-blue-600' : 'border-transparent hover:border-blue-300'}`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="p-8 md:p-12 flex flex-col">
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded tracking-wide uppercase">
                {product.category}
              </span>
              {product.season && (
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded tracking-wide uppercase">
                  Season: {product.season}
                </span>
              )}
              {product.in_stock !== undefined && (
                <span className={`inline-block px-3 py-1 text-xs font-bold rounded tracking-wide uppercase ${product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-4">
              {product.name}
            </h1>
            
            <div className="mb-6 space-y-2">
              <div className="text-3xl font-black text-gray-900">
                ₦{(product.price + customizationCost).toLocaleString()}
              </div>
              {isCustomizing && customizationCost > 0 && (
                <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 space-y-1 border border-blue-100">
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span>₦{product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customization:</span>
                    <span>₦{customizationCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-blue-200 pt-1 mt-1">
                    <span>Total:</span>
                    <span>₦{(product.price + customizationCost).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>
            
            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-900 uppercase">Select Size</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 text-sm font-bold rounded-md border transition-all flex items-center justify-center ${
                        selectedSize === size
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-blue-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-900 uppercase">Select Colour</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-xs font-bold rounded-md border transition-all flex items-center justify-center ${
                        selectedColor === color
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-blue-600'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customization */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase">Add Customization</h3>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={isCustomizing}
                      onChange={() => setIsCustomizing(!isCustomizing)}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${isCustomizing ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isCustomizing ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
              
              {isCustomizing && (
                <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs text-gray-500 mb-2">₦500 per letter/number</p>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name on Jersey</label>
                    <input 
                      type="text" 
                      maxLength={15}
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                      placeholder="e.g. MESSI"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Number</label>
                    <input 
                      type="text" 
                      maxLength={2}
                      value={customNumber}
                      onChange={(e) => setCustomNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Quantity</h3>
              <div className="flex items-center border border-gray-300 rounded-md w-fit">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold text-gray-900 border-x border-gray-300 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={product.in_stock === false || added}
              className={`w-full py-4 rounded-md font-bold text-lg flex items-center justify-center transition-colors mb-4 shadow-md ${
                product.in_stock === false 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : added 
                    ? 'bg-green-600 text-white shadow-green-600/20' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
              }`}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              {product.in_stock === false ? 'OUT OF STOCK' : added ? 'ADDED!' : 'ADD TO CART'}
            </motion.button>
            
            <a 
              href={`https://wa.me/2347065684228?text=${encodeURIComponent(`Hello, is the ${product.name} available?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-4 rounded-md font-bold text-lg flex items-center justify-center transition-colors mb-8 shadow-md shadow-[#25D366]/20"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              ASK IF AVAILABLE ON WHATSAPP
            </a>
            
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-gray-100">
              <div className="flex items-start gap-3">
                <Truck className="h-6 w-6 text-blue-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Nationwide Waybill</h4>
                  <p className="text-gray-500 text-xs mt-1">We deliver to any location fast and securely.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Authentic Quality</h4>
                  <p className="text-gray-500 text-xs mt-1">Premium materials guaranteed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <MessageSquare className="mr-3 h-6 w-6 text-blue-600" />
          Customer Reviews
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Review Form */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
            {reviewSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm font-medium">
                Review submitted successfully!
              </div>
            )}
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({...newReview, rating: star})}
                      className="focus:outline-none"
                    >
                      <Star className={`h-6 w-6 ${newReview.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={newReview.user_name}
                  onChange={(e) => setNewReview({...newReview, user_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                <textarea 
                  required
                  rows={4}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none"
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={isSubmittingReview}
                className="w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-md font-bold transition-colors disabled:opacity-70"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          {/* Review List */}
          <div className="lg:col-span-2">
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">{review.user_name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-4 w-4 ${review.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                <p className="text-gray-500">Be the first to review this jersey!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
