import { motion } from 'framer-motion';
import { useState } from 'react';
import { FormData } from '../types';
import Image from 'next/image';

interface LastikOnerisi {
  id: string;
  marka: string;
  model: string;
  fiyat: number;
  gorselUrl: string;
  guvenirlikPuani: number;
  ozellikler: string[];
  uygunlukPuani: number;
}

interface AiOnerisiSectionProps {
  formData: FormData;
  t?: any;
}

const AiOnerisiSection: React.FC<AiOnerisiSectionProps> = ({ formData, t }) => {
  const [oneriler] = useState<LastikOnerisi[]>([
    {
      id: '1',
      marka: 'Bridgestone',
      model: 'Potenza Sport',
      fiyat: 4999,
      gorselUrl: '/images/tires/bridgestone-potenza.jpg',
      guvenirlikPuani: 98,
      ozellikler: ['Yüksek Performans', 'Islak Zeminde Üstün Tutuş'],
      uygunlukPuani: 98
    },
    {
      id: '2',
      marka: 'Continental',
      model: 'SportContact 7',
      fiyat: 5499,
      gorselUrl: '/images/tires/continental-sport.jpg',
      guvenirlikPuani: 95,
      ozellikler: ['Dengeli Performans', 'Düşük Yuvarlanma Direnci'],
      uygunlukPuani: 95
    },
    {
      id: '3',
      marka: 'BBS',
      model: 'CH-R II Jant',
      fiyat: 12999,
      gorselUrl: '/images/wheels/bbs-chr.jpg',
      guvenirlikPuani: 93,
      ozellikler: ['Premium Kalite', 'Hafif Tasarım'],
      uygunlukPuani: 93
    },
    {
      id: '4',
      marka: 'OZ Racing',
      model: 'Superturismo',
      fiyat: 9999,
      gorselUrl: '/images/wheels/oz-racing.jpg',
      guvenirlikPuani: 90,
      ozellikler: ['Sportif Tasarım', 'Yüksek Performans'],
      uygunlukPuani: 90
    }
  ]);

  const formatFiyat = (fiyat: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(fiyat);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-dark-200 p-4 sm:p-8 rounded-xl border border-gray-700 shadow-lg"
    >
      <h3 className="text-xl sm:text-2xl font-medium text-white mb-2">
        AI Lastik Önerileri
      </h3>

      <div className="mb-6">
        <h4 className="text-lg text-gray-300 mb-2">
          En çok tercih edilen lastikler
        </h4>
        <p className="text-gray-400 text-sm">
          Aracınıza ve kullanım şeklinize en uygun lastik önerileri
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {oneriler.map((oneri) => (
          <motion.div
            key={oneri.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-300 rounded-lg overflow-hidden relative"
          >
            {/* Güvenirlik Puanı */}
            <div className="absolute top-4 right-4 bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-full z-10 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{oneri.guvenirlikPuani}%</span>
            </div>

            {/* Ürün Görseli */}
            <div className="relative h-48 bg-dark-400">
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <Image
                  src={oneri.gorselUrl}
                  alt={`${oneri.marka} ${oneri.model}`}
                  width={200}
                  height={200}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>

            {/* Ürün Bilgileri */}
            <div className="p-4">
              <h3 className="text-white font-medium text-lg mb-2">
                {oneri.marka} {oneri.model}
              </h3>

              {/* Özellikler */}
              <div className="space-y-1 mb-3">
                {oneri.ozellikler.map((ozellik, idx) => (
                  <div key={idx} className="text-gray-400 text-sm">
                    {ozellik}
                  </div>
                ))}
              </div>

              {/* Uygunluk Puanı */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">Uygunluk</span>
                  <span className="text-gray-300">{oneri.uygunlukPuani}%</span>
                </div>
                <div className="w-full bg-dark-400 rounded-full h-1">
                  <div
                    className="bg-red-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${oneri.uygunlukPuani}%` }}
                  />
                </div>
              </div>

              {/* Fiyat ve Sepete Ekle */}
              <div className="flex items-center justify-between">
                <div className="text-red-500 text-lg font-bold">
                  ₺{formatFiyat(oneri.fiyat)}
                </div>
                <button
                  className="text-white"
                  aria-label="Sepete Ekle"
                >
                  <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AiOnerisiSection; 