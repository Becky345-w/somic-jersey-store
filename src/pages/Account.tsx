import React, { useState, useEffect } from 'react';
import { User, Package, Settings, LogOut, ChevronRight, Clock, CheckCircle2, Truck, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Account() {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
    
    if (user) {
      const fullName = user.user_metadata?.full_name || '';
      const parts = fullName.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setPhone(user.user_metadata?.phone || '');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    setLoading(true);
    setMsg({ type: '', text: '' });
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          phone: phone
        }
      });
      
      if (error) throw error;
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email || !supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setMsg({ type: 'success', text: 'Password reset link sent to your email!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to send reset link' });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = () => {
    const savedAdmins = JSON.parse(localStorage.getItem('somic_admins') || '[]');
    const masterAdmin = { email: 'delimabethel@gmail.com' };
    const allAdmins = [...savedAdmins, masterAdmin];
    return allAdmins.some(admin => admin.email.toLowerCase() === user.email?.toLowerCase());
  };

  const orders = JSON.parse(localStorage.getItem('somic_orders') || '[]').filter((o: any) => o.email === user.email);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl uppercase">
                {user.user_metadata.full_name?.[0] || user.email?.[0] || 'U'}
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{user.user_metadata.full_name || 'User'}</h2>
                <p className="text-sm text-gray-500 truncate max-w-[150px]">{user.email}</p>
              </div>
            </div>
            <nav className="p-2 flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-colors ${activeTab === 'profile' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <User className="h-5 w-5" /> Profile
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-colors ${activeTab === 'orders' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Package className="h-5 w-5" /> Orders
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-colors ${activeTab === 'settings' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Settings className="h-5 w-5" /> Settings
              </button>

              {isAdmin() && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-3 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-md font-bold transition-colors border-t border-gray-100 mt-2"
                >
                  <ShieldAlert className="h-5 w-5" /> Admin Dashboard
                </button>
              )}

              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-md font-medium transition-colors md:mt-4"
              >
                <LogOut className="h-5 w-5" /> Logout
              </button>
            </nav>
          </div>
        </div>
        
        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 uppercase tracking-tight">Personal Information</h2>
              
              {msg.text && activeTab === 'profile' && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {msg.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                  <p>{msg.text}</p>
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input type="email" defaultValue={user.email} disabled className="w-full px-4 py-2.5 rounded-md border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" 
                    />
                  </div>
                </div>
                
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-bold transition-colors shadow-md shadow-blue-600/20 uppercase text-sm disabled:bg-blue-400"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-tight">Your Orders</h2>
              {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                  <button 
                    onClick={() => navigate('/')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-bold transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{order.id}</h3>
                          <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()} • {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-black text-gray-900">₦{order.total.toLocaleString()}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {order.status === 'Received' ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Truck className="h-3.5 w-3.5 text-blue-500" />
                            )}
                            <span className={`text-xs font-bold uppercase ${order.status === 'Received' ? 'text-green-500' : 'text-blue-500'}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate(`/track-order?id=${order.id}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-bold text-gray-700 transition-colors"
                        >
                          Track Order <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 uppercase tracking-tight">Account Settings</h2>
              
              {msg.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {msg.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                  <p>{msg.text}</p>
                </div>
              )}

              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">Password</h3>
                  <button 
                    onClick={handlePasswordReset}
                    disabled={loading}
                    className="text-blue-600 font-bold hover:underline text-sm disabled:text-blue-400"
                  >
                    {loading ? 'Sending link...' : 'Change Password'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2">We will send a password reset link to your email address.</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600" />
                      <span className="text-sm text-gray-700">Order updates via Email</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600" />
                      <span className="text-sm text-gray-700">Promotions and new arrivals</span>
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <button className="text-red-600 font-bold hover:underline text-sm">Delete Account</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
