import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    state: '',
    park: '',
  });

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      const fullName = user.user_metadata?.full_name || '';
      const parts = fullName.split(' ');
      const fName = parts[0] || '';
      const lName = parts.slice(1).join(' ') || '';
      const phoneNum = user.user_metadata?.phone || '';

      setFormData(prev => ({
        ...prev,
        firstName: fName,
        lastName: lName,
        phone: phoneNum
      }));
    }
  }, [user]);

  const stateParks: Record<string, string[]> = {
    'Abia': ['Umuahia - isi gate', 'Umuahia - Umudike', 'Aba - main park', 'Ohafia - Ebem park'],
    'Lagos': ['Oshodi Park', 'Ojota Motor Park', 'Jibowu Terminal', 'Mile 2 Park'],
    'Rivers': ['Waterlines', 'Choba Park', 'Eleme Junction'],
    'Abuja': ['Jabi Park', 'Utako Park', 'Nyanya Park'],
    'Enugu': ['Holy Ghost Park', 'Old Park', 'Gariki Park'],
    'Kano': ['Sabon Gari Park', 'Kofar Ruwa'],
    'Other': ['Main Park']
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Reset park if state changes
      if (name === 'state') {
        newData.park = '';
      }
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Save order to localStorage for admin panel
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      id: orderId,
      customer: `${formData.firstName} ${formData.lastName}`,
      email: user?.email || 'guest@example.com',
      phone: formData.phone,
      state: formData.state,
      park: formData.park,
      items: items,
      total: cartTotal,
      status: 'Placed',
      date: new Date().toISOString(),
    };
    
    const existingOrders = JSON.parse(localStorage.getItem('somic_orders') || '[]');
    localStorage.setItem('somic_orders', JSON.stringify([newOrder, ...existingOrders]));

    setTimeout(() => {
      setFinalTotal(cartTotal);
      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
    }, 1500);
  };

  if (items.length === 0 && !isSuccess) {
    navigate('/cart');
    return null;
  }

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100">
          <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Thank you for shopping at Somic's Jersey Store. Please complete your bank transfer using the details provided below. Your order will be shipped via waybill once payment is confirmed.
          </p>
          
          <div className="bg-gray-50 p-6 rounded-lg text-left max-w-md mx-auto mb-8 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm">Transfer Details</h3>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-semibold">Bank:</span> Zenith Bank</p>
              <p><span className="font-semibold">Account Name:</span> Somic's Jersey Store</p>
              <p><span className="font-semibold">Account Number:</span> 1012345678</p>
              <p><span className="font-semibold">Amount to Pay:</span> <span className="text-blue-600 font-bold">₦{finalTotal.toLocaleString()}</span></p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={`https://wa.me/2347065684228?text=${encodeURIComponent('Hello Somic\'s Jersey Store, I just placed an order. Here is my payment receipt.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-bold rounded-md text-white bg-[#25D366] hover:bg-[#20b858] transition-colors uppercase"
            >
              Send Receipt to WhatsApp
            </a>
            <Link 
              to="/" 
              className="inline-flex items-center justify-center px-8 py-3 text-base font-bold rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors uppercase"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Checkout Form */}
        <div className="flex-grow">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Shipping Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase border-b border-gray-100 pb-4">1. Delivery Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" required name="firstName" value={formData.firstName} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" required name="lastName" value={formData.lastName} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" required name="phone" value={formData.phone} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select 
                    required name="state" value={formData.state} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                  >
                    <option value="">Select State</option>
                    {Object.keys(stateParks).map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designated Park</label>
                  <select 
                    required name="park" value={formData.park} onChange={handleInputChange}
                    disabled={!formData.state}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Select Park</option>
                    {formData.state && stateParks[formData.state]?.map(park => (
                      <option key={park} value={park}>{park}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-md p-4">
                <h3 className="text-sm font-bold text-orange-800 mb-1">Store Policies</h3>
                <ul className="text-sm text-orange-700 list-disc list-inside space-y-1">
                  <li><strong>No Refund Policy:</strong> All sales are final.</li>
                  <li><strong>Payment Validates Order:</strong> Your order will only be processed after payment is confirmed.</li>
                  <li><strong>Waybill Fee:</strong> The waybill fee is paid by the customer upon delivery at the designated park.</li>
                </ul>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase border-b border-gray-100 pb-4">2. Payment Method</h2>
              
              <div className="border-2 border-blue-600 bg-blue-50 rounded-lg p-4 flex items-start gap-4">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded-full border-4 border-blue-600 bg-white"></div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Bank Transfer
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Transfer the total amount to our bank account. Your order will be processed once payment is confirmed.
                  </p>
                  
                  <div className="mt-4 bg-white p-4 rounded border border-blue-200 text-sm space-y-2">
                    <div className="flex justify-between"><span className="text-gray-500">Bank Name:</span> <span className="font-bold">Zenith Bank</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Account Name:</span> <span className="font-bold">Somic's Jersey Store</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Account Number:</span> <span className="font-bold tracking-wider">1012345678</span></div>
                  </div>
                </div>
              </div>
            </div>

            <motion.button 
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-md font-bold text-lg transition-colors shadow-md shadow-blue-600/20 uppercase disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Order'}
            </motion.button>
          </form>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase border-b border-gray-100 pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                  <img src={item.product.image_url} alt={item.product.name} className="w-16 h-16 object-cover rounded bg-gray-50" />
                  <div className="flex-grow">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity} | Size: {item.size}</p>
                    {item.customName && <p className="text-[10px] text-blue-600 font-medium uppercase">Custom: {item.customName} ({item.customNumber})</p>}
                    <p className="text-sm font-bold text-blue-600 mt-1">₦{((item.product.price + (item.customizationCost || 0)) * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Jersey Price</span>
                <span className="font-medium text-gray-900">₦{items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Customization</span>
                <span className="font-medium text-gray-900">₦{items.reduce((acc, item) => acc + ((item.customizationCost || 0) * item.quantity), 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-medium text-blue-600 text-xs">Paid at the park</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-xl font-black text-blue-600">₦{cartTotal.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
