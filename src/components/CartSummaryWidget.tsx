import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function CartSummaryWidget() {
  const { items, cartTotal } = useCart();
  const location = useLocation();

  const isCartOrCheckout = location.pathname === '/cart' || location.pathname === '/checkout';

  if (items.length === 0 || isCartOrCheckout) return null;

  const jerseyTotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const customizationTotal = items.reduce((acc, item) => acc + ((item.customizationCost || 0) * item.quantity), 0);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 md:bottom-8 right-4 left-4 md:left-auto md:right-8 md:w-80 z-40"
      >
        <div className="bg-white rounded-xl shadow-2xl border border-blue-100 overflow-hidden">
          <div className="bg-blue-600 px-4 py-2 flex justify-between items-center">
            <h3 className="text-white font-bold text-xs uppercase flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Cart Summary
            </h3>
            <span className="bg-white text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full">
              {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
            </span>
          </div>
          
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Jersey Price</span>
              <span className="font-bold text-gray-900">₦{jerseyTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Customization</span>
              <span className="font-bold text-gray-900">₦{customizationTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Delivery Fee</span>
              <span className="text-[10px] text-blue-600 font-medium italic">Calculated at checkout</span>
            </div>
            
            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">Total</span>
              <span className="text-lg font-black text-blue-600">₦{cartTotal.toLocaleString()}</span>
            </div>
            
            <Link 
              to="/cart"
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md font-bold text-xs flex items-center justify-center gap-2 transition-colors uppercase shadow-lg shadow-blue-600/20"
            >
              View Cart & Checkout
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
