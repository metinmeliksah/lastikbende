'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { CartProvider } from './contexts/CartContext';
import { AdresProvider } from './contexts/AdresContext';
import { SiparisProvider } from './contexts/SiparisContext';
import { AuthProvider } from './contexts/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <AdresProvider>
          <SiparisProvider>
            <div>
              <Navbar />
              <main className="bg-dark-400 text-gray-100">
                {children}
              </main>
              <Footer />
            </div>
          </SiparisProvider>
        </AdresProvider>
      </CartProvider>
    </AuthProvider>
  );
} 