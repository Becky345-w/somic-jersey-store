import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Admin from './pages/Admin';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import TrackOrder from './pages/TrackOrder';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import HelpCenter from './pages/HelpCenter';
import HowToShop from './pages/HowToShop';
import WelcomeScreen from './components/WelcomeScreen';
import WhatsAppChat from './components/WhatsAppChat';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <WelcomeScreen />
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
        <Navbar />
        <main className="flex-grow pb-20 md:pb-0">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/how-to-shop" element={<HowToShop />} />
            
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/track-order" element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
        <MobileBottomNav />
        <WhatsAppChat />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
