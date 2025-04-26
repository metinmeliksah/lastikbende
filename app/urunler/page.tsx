'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ProductSpecs {
  "Ebat": string;
  "Yük İndeksi": string;
  "Hız Sembolü": string;
  "Dış Gürültü": string;
  "Yakıt Verimliliği": string;
  "Islak Tutuş": string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  brand: string;
  category: string;
  specs: ProductSpecs;
}

// Örnek ürün verileri
const products: Product[] = [
  // Michelin Lastikleri
  {
    id: 1,
    name: "Michelin Primacy 4",
    price: "2500 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Michelin+Primacy+4",
    brand: "Michelin",
    category: "Lastik",
    specs: {
      "Ebat": "205/55 R16",
      "Yük İndeksi": "91",
      "Hız Sembolü": "V",
      "Dış Gürültü": "70 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 2,
    name: "Michelin Primacy 4",
    price: "2800 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Michelin+Primacy+4",
    brand: "Michelin",
    category: "Lastik",
    specs: {
      "Ebat": "215/55 R17",
      "Yük İndeksi": "94",
      "Hız Sembolü": "V",
      "Dış Gürültü": "71 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 3,
    name: "Michelin Primacy 4",
    price: "3200 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Michelin+Primacy+4",
    brand: "Michelin",
    category: "Lastik",
    specs: {
      "Ebat": "225/45 R18",
      "Yük İndeksi": "95",
      "Hız Sembolü": "W",
      "Dış Gürültü": "72 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  // Goodyear Lastikleri
  {
    id: 4,
    name: "Goodyear EfficientGrip",
    price: "2200 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Goodyear+EfficientGrip",
    brand: "Goodyear",
    category: "Lastik",
    specs: {
      "Ebat": "215/65 R17",
      "Yük İndeksi": "99",
      "Hız Sembolü": "H",
      "Dış Gürültü": "71 dB",
      "Yakıt Verimliliği": "A",
      "Islak Tutuş": "B"
    }
  },
  {
    id: 5,
    name: "Goodyear EfficientGrip",
    price: "2400 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Goodyear+EfficientGrip",
    brand: "Goodyear",
    category: "Lastik",
    specs: {
      "Ebat": "225/55 R17",
      "Yük İndeksi": "97",
      "Hız Sembolü": "V",
      "Dış Gürültü": "70 dB",
      "Yakıt Verimliliği": "A",
      "Islak Tutuş": "B"
    }
  },
  // Continental Lastikleri
  {
    id: 6,
    name: "Continental PremiumContact",
    price: "2300 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Continental+PremiumContact",
    brand: "Continental",
    category: "Lastik",
    specs: {
      "Ebat": "225/45 R18",
      "Yük İndeksi": "95",
      "Hız Sembolü": "W",
      "Dış Gürültü": "69 dB",
      "Yakıt Verimliliği": "A",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 7,
    name: "Continental PremiumContact",
    price: "2600 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Continental+PremiumContact",
    brand: "Continental",
    category: "Lastik",
    specs: {
      "Ebat": "235/45 R18",
      "Yük İndeksi": "98",
      "Hız Sembolü": "W",
      "Dış Gürültü": "70 dB",
      "Yakıt Verimliliği": "A",
      "Islak Tutuş": "A"
    }
  },
  // Pirelli Lastikleri
  {
    id: 8,
    name: "Pirelli Cinturato",
    price: "2400 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Pirelli+Cinturato",
    brand: "Pirelli",
    category: "Lastik",
    specs: {
      "Ebat": "235/55 R19",
      "Yük İndeksi": "101",
      "Hız Sembolü": "V",
      "Dış Gürültü": "72 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 9,
    name: "Pirelli Cinturato",
    price: "2700 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Pirelli+Cinturato",
    brand: "Pirelli",
    category: "Lastik",
    specs: {
      "Ebat": "245/45 R19",
      "Yük İndeksi": "102",
      "Hız Sembolü": "W",
      "Dış Gürültü": "73 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  // Bridgestone Lastikleri
  {
    id: 10,
    name: "Bridgestone Turanza",
    price: "2600 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Bridgestone+Turanza",
    brand: "Bridgestone",
    category: "Lastik",
    specs: {
      "Ebat": "245/40 R20",
      "Yük İndeksi": "99",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "71 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 11,
    name: "Bridgestone Turanza",
    price: "2900 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Bridgestone+Turanza",
    brand: "Bridgestone",
    category: "Lastik",
    specs: {
      "Ebat": "255/40 R20",
      "Yük İndeksi": "101",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "72 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  // Dunlop Lastikleri
  {
    id: 12,
    name: "Dunlop Sport",
    price: "2100 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Dunlop+Sport",
    brand: "Dunlop",
    category: "Lastik",
    specs: {
      "Ebat": "255/35 R21",
      "Yük İndeksi": "98",
      "Hız Sembolü": "W",
      "Dış Gürültü": "73 dB",
      "Yakıt Verimliliği": "C",
      "Islak Tutuş": "B"
    }
  },
  {
    id: 13,
    name: "Dunlop Sport",
    price: "2400 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Dunlop+Sport",
    brand: "Dunlop",
    category: "Lastik",
    specs: {
      "Ebat": "265/35 R21",
      "Yük İndeksi": "99",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "74 dB",
      "Yakıt Verimliliği": "C",
      "Islak Tutuş": "B"
    }
  },
  // Hankook Lastikleri
  {
    id: 14,
    name: "Hankook Ventus",
    price: "2000 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Hankook+Ventus",
    brand: "Hankook",
    category: "Lastik",
    specs: {
      "Ebat": "265/30 R22",
      "Yük İndeksi": "97",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "74 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  {
    id: 15,
    name: "Hankook Ventus",
    price: "2300 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Hankook+Ventus",
    brand: "Hankook",
    category: "Lastik",
    specs: {
      "Ebat": "275/30 R22",
      "Yük İndeksi": "98",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "75 dB",
      "Yakıt Verimliliği": "B",
      "Islak Tutuş": "A"
    }
  },
  // Yokohama Lastikleri
  {
    id: 16,
    name: "Yokohama Advan",
    price: "2700 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Yokohama+Advan",
    brand: "Yokohama",
    category: "Lastik",
    specs: {
      "Ebat": "275/25 R23",
      "Yük İndeksi": "95",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "75 dB",
      "Yakıt Verimliliği": "C",
      "Islak Tutuş": "B"
    }
  },
  {
    id: 17,
    name: "Yokohama Advan",
    price: "3000 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Yokohama+Advan",
    brand: "Yokohama",
    category: "Lastik",
    specs: {
      "Ebat": "285/25 R23",
      "Yük İndeksi": "96",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "76 dB",
      "Yakıt Verimliliği": "C",
      "Islak Tutuş": "B"
    }
  },
  // Jantlar
  {
    id: 18,
    name: "BBS CH-R",
    price: "4500 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=BBS+CH-R",
    brand: "BBS",
    category: "Jant",
    specs: {
      "Ebat": "18x8",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 19,
    name: "BBS CH-R",
    price: "5200 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=BBS+CH-R",
    brand: "BBS",
    category: "Jant",
    specs: {
      "Ebat": "19x8.5",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 20,
    name: "OZ Racing Leggera",
    price: "3800 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=OZ+Racing+Leggera",
    brand: "OZ Racing",
    category: "Jant",
    specs: {
      "Ebat": "18x8",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 21,
    name: "OZ Racing Leggera",
    price: "4500 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=OZ+Racing+Leggera",
    brand: "OZ Racing",
    category: "Jant",
    specs: {
      "Ebat": "19x8.5",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 22,
    name: "Enkei RPF1",
    price: "3500 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Enkei+RPF1",
    brand: "Enkei",
    category: "Jant",
    specs: {
      "Ebat": "17x8",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 23,
    name: "Enkei RPF1",
    price: "4200 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Enkei+RPF1",
    brand: "Enkei",
    category: "Jant",
    specs: {
      "Ebat": "18x8.5",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 24,
    name: "Rota Grid",
    price: "2800 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "17x8",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 25,
    name: "Rota Grid",
    price: "3500 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "18x8.5",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 26,
    name: "Rota Grid",
    price: "4200 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "19x9",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 27,
    name: "Rota Grid",
    price: "4900 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "20x9.5",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 28,
    name: "Rota Grid",
    price: "5600 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "21x10",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 29,
    name: "Rota Grid",
    price: "6300 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "22x10.5",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 30,
    name: "Rota Grid",
    price: "7000 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "23x11",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 31,
    name: "Rota Grid",
    price: "7700 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "24x11.5",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 32,
    name: "Rota Grid",
    price: "8400 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "25x12",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 33,
    name: "Rota Grid",
    price: "9100 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "26x12.5",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 34,
    name: "Rota Grid",
    price: "9800 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "27x13",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 35,
    name: "Rota Grid",
    price: "10500 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "28x13.5",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 36,
    name: "Rota Grid",
    price: "11200 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "29x14",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 37,
    name: "Rota Grid",
    price: "11900 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "30x14.5",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 38,
    name: "Rota Grid",
    price: "12600 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "31x15",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 39,
    name: "Rota Grid",
    price: "13300 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "32x15.5",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 40,
    name: "Rota Grid",
    price: "14000 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "33x16",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 41,
    name: "Rota Grid",
    price: "14700 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "34x16.5",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 42,
    name: "Rota Grid",
    price: "15400 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "35x17",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 43,
    name: "Rota Grid",
    price: "16100 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "36x17.5",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 44,
    name: "Rota Grid",
    price: "16800 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "37x18",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  },
  {
    id: 45,
    name: "Rota Grid",
    price: "17500 TL",
    image: "https://placehold.co/600x400/2563eb/ffffff?text=Rota+Grid",
    brand: "Rota",
    category: "Jant",
    specs: {
      "Ebat": "38x18.5",
      "Yük İndeksi": "1000",
      "Hız Sembolü": "Y",
      "Dış Gürültü": "N/A",
      "Yakıt Verimliliği": "N/A",
      "Islak Tutuş": "N/A"
    }
  }
];

interface SearchFilters {
  brand: string;
  size: string;
  minPrice: string;
  maxPrice: string;
  loadIndex: string;
  speedIndex: string;
}

export default function UrunlerPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    brand: '',
    size: '',
    minPrice: '',
    maxPrice: '',
    loadIndex: '',
    speedIndex: ''
  });

  const productsPerPage = 9;

  const filteredProducts = products.filter(product => {
    if (searchFilters.brand && product.brand !== searchFilters.brand) return false;
    if (searchFilters.size && product.specs["Ebat"] !== searchFilters.size) return false;
    if (searchFilters.minPrice && parseFloat(product.price) < parseFloat(searchFilters.minPrice)) return false;
    if (searchFilters.maxPrice && parseFloat(product.price) > parseFloat(searchFilters.maxPrice)) return false;
    if (searchFilters.loadIndex && product.specs["Yük İndeksi"] !== searchFilters.loadIndex) return false;
    if (searchFilters.speedIndex && product.specs["Hız Sembolü"] !== searchFilters.speedIndex) return false;
    return true;
  });

  // Sayfalama hesaplamaları
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Sayfa numaralarını oluştur
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-dark-400 pt-20">
      {/* Arama Butonu */}
      <button
        onClick={() => setIsSearchOpen(true)}
        className={`fixed right-4 top-1/2 transform -translate-y-1/2 bg-primary text-white p-3 rounded-l-lg shadow-lg hover:bg-red-600 transition-all duration-300 z-50 ${
          isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <MagnifyingGlassIcon className="h-6 w-6" />
      </button>

      {/* Arama Paneli */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-80 bg-dark-300 p-6 shadow-xl z-40"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Filtrele</h2>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="bg-primary text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Marka Filtresi */}
              <div>
                <label className="block text-gray-300 mb-2">Marka</label>
                <select
                  value={searchFilters.brand}
                  onChange={(e) => setSearchFilters({ ...searchFilters, brand: e.target.value })}
                  className="w-full bg-dark-200 text-white rounded-md p-2"
                >
                  <option value="">Tüm Markalar</option>
                  {Array.from(new Set(products.map(p => p.brand))).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Lastik Ölçüsü */}
              <div>
                <label className="block text-gray-300 mb-2">Lastik Ölçüsü</label>
                <select
                  value={searchFilters.size}
                  onChange={(e) => setSearchFilters({ ...searchFilters, size: e.target.value })}
                  className="w-full bg-dark-200 text-white rounded-md p-2"
                >
                  <option value="">Tüm Ölçüler</option>
                  {Array.from(new Set(products.map(p => p.specs["Ebat"]))).map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              {/* Fiyat Aralığı */}
              <div>
                <label className="block text-gray-300 mb-2">Fiyat Aralığı</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={searchFilters.minPrice}
                    onChange={(e) => setSearchFilters({ ...searchFilters, minPrice: e.target.value })}
                    className="w-1/2 bg-dark-200 text-white rounded-md p-2"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={searchFilters.maxPrice}
                    onChange={(e) => setSearchFilters({ ...searchFilters, maxPrice: e.target.value })}
                    className="w-1/2 bg-dark-200 text-white rounded-md p-2"
                  />
                </div>
              </div>

              {/* Yük İndeksi */}
              <div>
                <label className="block text-gray-300 mb-2">Yük İndeksi</label>
                <select
                  value={searchFilters.loadIndex}
                  onChange={(e) => setSearchFilters({ ...searchFilters, loadIndex: e.target.value })}
                  className="w-full bg-dark-200 text-white rounded-md p-2"
                >
                  <option value="">Tüm Yük İndeksleri</option>
                  {Array.from(new Set(products.map(p => p.specs["Yük İndeksi"]))).map(loadIndex => (
                    <option key={loadIndex} value={loadIndex}>{loadIndex}</option>
                  ))}
                </select>
              </div>

              {/* Hız İndeksi */}
              <div>
                <label className="block text-gray-300 mb-2">Hız İndeksi</label>
                <select
                  value={searchFilters.speedIndex}
                  onChange={(e) => setSearchFilters({ ...searchFilters, speedIndex: e.target.value })}
                  className="w-full bg-dark-200 text-white rounded-md p-2"
                >
                  <option value="">Tüm Hız İndeksleri</option>
                  {Array.from(new Set(products.map(p => p.specs["Hız Sembolü"]))).map(speedIndex => (
                    <option key={speedIndex} value={speedIndex}>{speedIndex}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ürün Listesi Container */}
      <div 
        className={`container mx-auto px-4 py-8 transition-all duration-300 ${
          isSearchOpen ? 'pr-80' : ''
        }`}
      >
        <h1 className="text-3xl font-bold text-white mb-8">Ürünlerimiz</h1>

        {/* Ürün Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-dark-300 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 bg-gray-800">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.jpg'; // Varsayılan resim
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                <p className="text-gray-400 mb-2">{product.brand}</p>
                <p className="text-primary text-xl font-bold mb-4">{product.price}</p>
                
                {/* Ürün Özellikleri */}
                <div className="text-sm text-gray-400 space-y-1">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-500">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>

                <button className="mt-4 w-full bg-primary text-white py-2 rounded-md hover:bg-red-600 transition-colors">
                  Sepete Ekle
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sayfalama */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${
              currentPage === 1
                ? 'bg-dark-200 text-gray-500 cursor-not-allowed'
                : 'bg-dark-200 text-gray-300 hover:bg-dark-100'
            }`}
          >
            Önceki
          </button>
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-4 py-2 rounded-md ${
                currentPage === number
                  ? 'bg-primary text-white'
                  : 'bg-dark-200 text-gray-300 hover:bg-dark-100'
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages
                ? 'bg-dark-200 text-gray-500 cursor-not-allowed'
                : 'bg-dark-200 text-gray-300 hover:bg-dark-100'
            }`}
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
} 