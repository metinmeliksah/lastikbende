'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface Product {
  id: number;
  model: string;
  genislik_mm: number;
  profil: number;
  cap_inch: number;
  urun_resmi_0: string;
}

interface Shop {
  id: number;
  name: string;
  city: string;
}

interface CartItem {
  id: string;
  product: Product;
  shop: Shop;
  quantity: number;
  price: number;
}

interface SupabaseCartItem {
  id: string;
  stok_id: number;
  quantity: number;
  price: number;
  stok: {
    urundetay: {
      urun_id: number;
      model: string;
      genislik_mm: string;
      profil: string;
      cap_inch: string;
      urun_resmi_0: string;
    };
    magaza: {
      id: number;
      isim: string;
      sehir: string;
    };
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, shop: Shop, quantity: number, price: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
  subtotal: number;
  shipping: number;
  total: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  loading: false,
  subtotal: 0,
  shipping: 0,
  total: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Local storage key for cart
  const CART_STORAGE_KEY = 'cart_items';

  // Load cart items from localStorage or Supabase
  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      // Load from localStorage for unauthenticated users
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setItems(parsedCart);
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      }
      setLoading(false);
    }
  }, [user]);

  // Sync localStorage cart with Supabase when user logs in
  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          // Sync each item to Supabase
          parsedCart.forEach(async (item: CartItem) => {
            await addToCart(item.product, item.shop, item.quantity, item.price);
          });
          // Clear localStorage after sync
          localStorage.removeItem(CART_STORAGE_KEY);
        } catch (error) {
          console.error('Error syncing cart with Supabase:', error);
        }
      }
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('carts')
        .select(`
          id,
          stok_id,
          quantity,
          price,
          stok:stok_id (
            urundetay (
              urun_id,
              model,
              genislik_mm,
              profil,
              cap_inch,
              urun_resmi_0
            ),
            magaza (
              id,
              isim,
              sehir
            )
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      if (!data) {
        setItems([]);
        return;
      }

      const formattedItems = (data as unknown as SupabaseCartItem[]).map(item => ({
        id: item.id,
        product: {
          id: item.stok.urundetay.urun_id,
          model: item.stok.urundetay.model,
          genislik_mm: Number(item.stok.urundetay.genislik_mm),
          profil: Number(item.stok.urundetay.profil),
          cap_inch: Number(item.stok.urundetay.cap_inch),
          urun_resmi_0: item.stok.urundetay.urun_resmi_0
        },
        shop: {
          id: item.stok.magaza.id,
          name: item.stok.magaza.isim,
          city: item.stok.magaza.sehir
        },
        quantity: item.quantity,
        price: item.price
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Sepet bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, shop: Shop, quantity: number, price: number) => {
    try {
      if (user) {
        // Check if item exists in cart
        const { data: existingItem, error: fetchError } = await supabase
          .from('carts')
          .select('*')
          .eq('user_id', user.id)
          .eq('stok_id', product.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (existingItem) {
          // Update quantity if item exists
          const { error: updateError } = await supabase
            .from('carts')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('id', existingItem.id);

          if (updateError) throw updateError;
        } else {
          // Insert new item
          const { error: insertError } = await supabase
            .from('carts')
            .insert({
              user_id: user.id,
              stok_id: product.id,
              quantity,
              price
            });

          if (insertError) throw insertError;
        }

        await fetchCartItems();
      } else {
        // Handle unauthenticated user cart in localStorage
        const existingItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
        const existingItemIndex = existingItems.findIndex((item: CartItem) => item.product.id === product.id);

        if (existingItemIndex > -1) {
          existingItems[existingItemIndex].quantity += quantity;
        } else {
          existingItems.push({
            id: Math.random().toString(36).substr(2, 9),
            product,
            shop,
            quantity,
            price
          });
        }

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(existingItems));
        setItems(existingItems);
      }

      toast.success('Ürün sepete eklendi');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Ürün sepete eklenirken bir hata oluştu');
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      if (user) {
        const { error } = await supabase
          .from('carts')
          .delete()
          .eq('id', id);

        if (error) throw error;

        await fetchCartItems();
      } else {
        const existingItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
        const updatedItems = existingItems.filter((item: CartItem) => item.id !== id);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
        setItems(updatedItems);
      }

      toast.success('Ürün sepetten kaldırıldı');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Ürün sepetten kaldırılırken bir hata oluştu');
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(id);
      return;
    }

    try {
      if (user) {
        const { error } = await supabase
          .from('carts')
          .update({ quantity })
          .eq('id', id);

        if (error) throw error;

        await fetchCartItems();
      } else {
        const existingItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
        const updatedItems = existingItems.map((item: CartItem) => 
          item.id === id ? { ...item, quantity } : item
        );
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
        setItems(updatedItems);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Miktar güncellenirken bir hata oluştu');
    }
  };

  const clearCart = async () => {
    try {
      if (user) {
        const { error } = await supabase
          .from('carts')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;

        setItems([]);
      } else {
        localStorage.removeItem(CART_STORAGE_KEY);
        setItems([]);
      }

      toast.success('Sepet temizlendi');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Sepet temizlenirken bir hata oluştu');
    }
  };

  // Calculate totals
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over 1000 TL
  const total = subtotal + shipping;

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      loading,
      subtotal,
      shipping,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 