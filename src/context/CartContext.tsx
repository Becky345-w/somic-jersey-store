import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../lib/supabase';

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color?: string;
  customName?: string;
  customNumber?: string;
  customizationCost?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number, customName?: string, customNumber?: string, customizationCost?: number, color?: string) => void;
  removeFromCart: (productId: string, size: string, customName?: string, customNumber?: string, color?: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number, customName?: string, customNumber?: string, color?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('somic_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('somic_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, size: string, quantity = 1, customName = '', customNumber = '', customizationCost = 0, color = '') => {
    setItems(current => {
      const existing = current.find(item => 
        item.product.id === product.id && 
        item.size === size && 
        item.color === color &&
        item.customName === customName && 
        item.customNumber === customNumber
      );
      
      if (existing) {
        return current.map(item =>
          item.product.id === product.id && item.size === size && item.color === color && item.customName === customName && item.customNumber === customNumber
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...current, { product, quantity, size, color, customName, customNumber, customizationCost }];
    });
  };

  const removeFromCart = (productId: string, size: string, customName = '', customNumber = '', color = '') => {
    setItems(current => current.filter(item => 
      !(item.product.id === productId && item.size === size && item.color === color && item.customName === customName && item.customNumber === customNumber)
    ));
  };

  const updateQuantity = (productId: string, size: string, quantity: number, customName = '', customNumber = '', color = '') => {
    if (quantity < 1) return;
    setItems(current =>
      current.map(item =>
        item.product.id === productId && item.size === size && item.color === color && item.customName === customName && item.customNumber === customNumber
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const cartTotal = items.reduce((total, item) => total + ((item.product.price + (item.customizationCost || 0)) * item.quantity), 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
