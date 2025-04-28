'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiFilter, FiCalendar, FiSearch } from 'react-icons/fi';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

interface Analysis {
  id: string;
  created_at: string;
  marka: string;
  model: string;
  ebat: string;
  image_url: string;
  user_id: string;
}

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 dakika
      gcTime: 1000 * 60 * 30, // 30 dakika
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Veri çekme fonksiyonu
async function fetchAnalyses(): Promise<Analysis[]> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Oturum açmanız gerekiyor');
  }

  const { data, error } = await supabase
    .from('analyses')
    .select('id, created_at, marka, model, ebat, image_url, user_id')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Analysis[];
}

function AnalizlerimContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'brand'>('date');
  const [showFilters, setShowFilters] = useState(false);

  // React Query ile veri çekme
  const { data: analyses = [], isLoading, error, refetch } = useQuery<Analysis[], Error>({
    queryKey: ['analyses'],
    queryFn: fetchAnalyses,
  });

  // Filtreleme ve sıralama
  const filteredAnalyses = analyses
    .filter((analysis: Analysis) => 
      analysis.marka.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.ebat.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: Analysis, b: Analysis) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.marka.localeCompare(b.marka);
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-400 pt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-dark-300 rounded w-48"></div>
            <div className="h-12 bg-dark-300 rounded w-full max-w-md"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-dark-300 rounded-xl p-4 h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-400 pt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Hata</h2>
            <p className="text-gray-400">
              {error.message || 'Analizler yüklenirken bir hata oluştu'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dark-400 pt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-white">Analizlerim</h1>
              <p className="text-gray-400 mt-2">
                Toplam {analyses.length} analiz bulundu
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-dark-300 text-white rounded-lg hover:bg-dark-200 transition-colors"
              >
                <FiFilter />
                Filtrele
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-dark-300 rounded-lg p-4 space-y-4"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Marka, model veya ebat ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-dark-200 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSortBy('date')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        sortBy === 'date'
                          ? 'bg-primary text-white'
                          : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
                      }`}
                    >
                      <FiCalendar className="inline-block mr-2" />
                      Tarihe Göre
                    </button>
                    <button
                      onClick={() => setSortBy('brand')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        sortBy === 'brand'
                          ? 'bg-primary text-white'
                          : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
                      }`}
                    >
                      Markaya Göre
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {filteredAnalyses.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-dark-300 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-white mb-2">Analiz Bulunamadı</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm
                  ? 'Arama kriterlerinize uygun analiz bulunamadı.'
                  : 'Henüz hiç analiz oluşturmadınız.'}
              </p>
              <Link
                href="/analiz"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Yeni Analiz Oluştur
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredAnalyses.map((analysis: Analysis) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-dark-300 rounded-xl overflow-hidden border border-gray-700 hover:border-primary transition-colors group"
                >
                  <div className="relative h-48">
                    <Image
                      src={analysis.image_url}
                      alt={`${analysis.marka} ${analysis.model}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">
                        {analysis.marka} {analysis.model}
                      </h3>
                      <span className="text-sm text-gray-400">
                        {new Date(analysis.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400">{analysis.ebat}</p>
                    </div>
                    <Link
                      href={`/analizlerim/${analysis.id}`}
                      className="block w-full text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Detayları Gör
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AnalizlerimPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnalizlerimContent />
    </QueryClientProvider>
  );
} 