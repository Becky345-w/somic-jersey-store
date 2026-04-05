import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { name: 'HOME', path: '/', icon: Home },
    { name: 'CATEGORIES', path: '/#categories', icon: LayoutGrid },
    { name: 'CART', path: '/cart', icon: ShoppingCart },
    { name: 'ACCOUNT', path: user ? '/account' : '/login', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-4 py-2 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path === '/#categories' && location.hash === '#categories');
        
        return (
          <Link 
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
          >
            <Icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
            <span className={`text-[10px] font-bold tracking-wider ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
