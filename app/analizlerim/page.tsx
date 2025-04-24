'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface Analysis {
  id: string;
  created_at: string;
  marka: string;
  model: string;
  ebat: string;
  image_url: string;
}

export default function AnalizlerimPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  async function fetchAnalyses() {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('id, created_at, marka, model, ebat, image_url')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Analizler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-400 pt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-dark-300 rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-dark-300 rounded-xl p-4 h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dark-400 pt-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-8"
        >
          Analizlerim
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((analysis) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-300 rounded-xl p-4 border border-gray-700 hover:border-primary transition-colors"
            >
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                <Image
                  src={analysis.image_url}
                  alt={`${analysis.marka} ${analysis.model}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  {analysis.marka} {analysis.model}
                </h3>
                <p className="text-gray-400">{analysis.ebat}</p>
                <p className="text-sm text-gray-500">
                  {new Date(analysis.created_at).toLocaleDateString('tr-TR')}
                </p>
                <Link
                  href={`/analizlerim/${analysis.id}`}
                  className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Detayları Gör
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
} 