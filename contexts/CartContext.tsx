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
  id: number;
  stok: {
    stok_id: number;
    urundetay: {
      urun_id: number;
      model: string;
      genislik_mm: string;
      profil: string;
      cap_inch: string;
      urun_resmi_0: string;
    };
    sellers: {
      id: number;
      isim: string;
      sehir: string;
    };
  };
  quantity: number;
  price: string;
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
  total: 0
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Calculate cart totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = items.length > 0 ? 50 : 0; // Example shipping cost
  const total = subtotal + shipping;

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      console.log('Fetching cart items for user:', user?.id);
      
      const { data, error } = await supabase
        .from('cart')
        .select(`
          id,
          stok!fk_cart_stok_id_fkey (
            stok_id,
            urundetay (
              urun_id,
              model,
              genislik_mm,
              profil,
              cap_inch,
              urun_resmi_0
            ),
            sellers (
              id,
              isim,
              sehir
            )
          ),
          quantity,
          price
        `)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error fetching cart items:', error);
        throw error;
      }

      console.log('Raw cart data:', data);

      if (!data || data.length === 0) {
        console.log('No cart items found');
        setItems([]);
        return;
      }

      const formattedItems = (data as unknown as SupabaseCartItem[]).map(item => {
        console.log('Processing cart item:', item);
        
        if (!item.stok?.urundetay || !item.stok?.sellers) {
          console.error('Invalid cart item data structure:', item);
          return null;
        }

        const formattedItem = {
          id: item.id.toString(),
          product: {
            id: item.stok.urundetay.urun_id,
            model: item.stok.urundetay.model,
            genislik_mm: Number(item.stok.urundetay.genislik_mm),
            profil: Number(item.stok.urundetay.profil),
            cap_inch: Number(item.stok.urundetay.cap_inch),
            urun_resmi_0: item.stok.urundetay.urun_resmi_0
          },
          shop: {
            id: item.stok.sellers.id,
            name: item.stok.sellers.isim,
            city: item.stok.sellers.sehir
          },
          quantity: item.quantity,
          price: Number(item.price)
        };

        console.log('Formatted item:', formattedItem);
        return formattedItem;
      }).filter((item): item is CartItem => item !== null);

      console.log('Final formatted items:', formattedItems);
      setItems(formattedItems);
    } catch (error) {
      console.error('Error in fetchCartItems:', error);
      toast.error('Sepet bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, shop: Shop, quantity: number, price: number) => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    try {
      console.log('Adding to cart:', { product, shop, quantity, price });

      // First, get the stok_id for the product
      const { data: stokData, error: stokError } = await supabase
        .from('stok')
        .select('stok_id, urun_id, magaza_id')
        .eq('urun_id', product.id)
        .eq('magaza_id', shop.id)
        .single();

      if (stokError) {
        console.error('Error finding stock:', stokError);
        throw stokError;
      }

      if (!stokData) {
        console.error('Stock not found for product:', product.id, 'and shop:', shop.id);
        toast.error('Ürün stokta bulunamadı');
        return;
      }

      console.log('Found stock data:', stokData);

      const { data: existingItem, error: fetchError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id)
        .eq('stok_id', stokData.stok_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing cart item:', fetchError);
        throw fetchError;
      }

      if (existingItem) {
        console.log('Updating existing cart item:', existingItem);
        const newQuantity = existingItem.quantity + quantity;
        const { error: updateError } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (updateError) {
          console.error('Error updating cart item:', updateError);
          throw updateError;
        }
      } else {
        console.log('Inserting new cart item');
        const { error: insertError } = await supabase
          .from('cart')
          .insert({
            user_id: user.id,
            stok_id: stokData.stok_id,
            quantity,
            price: price.toString() // Convert to string for DECIMAL type
          });

        if (insertError) {
          console.error('Error inserting cart item:', insertError);
          throw insertError;
        }
      }

      console.log('Successfully added to cart, refreshing items');
      await fetchCartItems();
      toast.success('Ürün sepete eklendi');
    } catch (error) {
      console.error('Error in addToCart:', error);
      toast.error('Ürün sepete eklenirken bir hata oluştu');
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCartItems();
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
      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('id', id);

      if (error) throw error;

      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Miktar güncellenirken bir hata oluştu');
    }
  };

  const clearCart = async () => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;

      setItems([]);
      toast.success('Sepet temizlendi');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Sepet temizlenirken bir hata oluştu');
    }
  };

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
  return useContext(CartContext);
} 