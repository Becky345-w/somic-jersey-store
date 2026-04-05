import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-xl shadow-sm p-12 max-w-2xl mx-auto">
          <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty!</h2>
          <p className="text-gray-500 mb-8">Browse our categories and discover our best deals!</p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-8 py-3 text-base font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors uppercase"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Cart ({items.length} items)</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-grow">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={`${item.product.id}-${item.size}`} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-gray-50 rounded-md overflow-hidden">
                    <img 
                      src={item.product.image_url} 
                      alt={item.product.name}
                      className="w-full h-full object-cover mix-blend-multiply"
                    />
                  </div>
                  
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/product/${item.product.id}`} className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">Size: <span className="font-semibold text-gray-900">{item.size}</span></p>
                      </div>
                      <div className="text-lg font-black text-gray-900">
                        ₦{item.product.price.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                      <button 
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        className="flex items-center text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        REMOVE
                      </button>
                      
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-bold text-gray-900 min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase border-b border-gray-100 pb-4">Cart Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-gray-600">
                <span className="text-sm">Jersey Price</span>
                <span className="font-bold text-gray-900">₦{items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center text-gray-600">
                <span className="text-sm">Customization</span>
                <span className="font-bold text-gray-900">₦{items.reduce((acc, item) => acc + ((item.customizationCost || 0) * item.quantity), 0).toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center text-gray-600">
                <span className="text-sm">Delivery Fee</span>
                <span className="text-xs text-blue-600 font-medium">Calculated at checkout</span>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-gray-600">
                <span className="text-sm font-bold">Subtotal</span>
                <span className="font-bold text-gray-900">₦{cartTotal.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="border-t-2 border-gray-100 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-2xl font-black text-blue-600">₦{cartTotal.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">* Delivery fee to be paid at the park</p>
            </div>
            
            <Link 
              to="/checkout"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-bold flex items-center justify-center transition-colors shadow-md shadow-blue-600/20 uppercase shadow-lg shadow-blue-600/30"
            >
              Checkout ({items.length})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
