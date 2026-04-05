import { Truck, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="flex flex-col gap-6">
            <div className="h-20 w-auto">
              <img 
                src="/logo.png" 
                alt="Somic's Jersey Store" 
                className="h-full w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1580087433295-ab2600c1030e?q=80&w=100&auto=format&fit=crop';
                }}
              />
            </div>
            <div>
              <p className="text-gray-400 text-sm max-w-xs">
                Premium Authentic Sports Jerseys. Nationwide Waybill & Fast Delivery.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link to="/how-to-shop" className="hover:text-blue-500 transition-colors">How to Shop</Link>
              </li>
              <li>
                <Link to="/help-center" className="hover:text-blue-500 transition-colors">Help Center & FAQ</Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-blue-500 transition-colors">Track Order</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Why Choose Us</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-blue-500 shrink-0" />
                <span>100% Authentic Quality Jerseys</span>
              </li>
              <li className="flex items-start gap-3">
                <Truck className="h-6 w-6 text-blue-500 shrink-0" />
                <span>Nationwide Waybill & Fast Delivery</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-blue-500 shrink-0" />
                <span>24/7 Customer Support</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Somic's Jersey Store. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin className="h-4 w-4" />
            <span>Shipping Nationwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
