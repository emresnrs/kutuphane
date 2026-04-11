'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  book_id: number;
  title: string;
  price: string; // From string decimal db
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (book_id: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load from local storage
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        localStorage.removeItem('cart');
      }
    }
  }, []);

  useEffect(() => {
    // Save to local storage when cart changes
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(p => p.book_id === item.book_id);
      if (existing) {
        return prev.map(p => p.book_id === item.book_id ? { ...p, quantity: p.quantity + item.quantity } : p);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (book_id: number) => {
    setCart(prev => prev.filter(p => p.book_id !== book_id));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
