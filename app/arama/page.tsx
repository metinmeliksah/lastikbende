'use client';

import { useState } from 'react';
import SearchBar from './components/SearchBar';
import SearchFilters from './components/SearchFilters';
import SearchResults from './components/SearchResults';
import { SearchResult } from './types';

interface SearchFilters {
  categories: string[];
  dateRange: string;
  tags: string[];
  sortBy: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    dateRange: 'all',
    tags: [],
    sortBy: 'relevance',
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setLoading(true);
    
    // Örnek arama sonuçları - gerçek uygulamada API'den gelecek
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'iPhone 14 Pro',
        description: 'Apple iPhone 14 Pro 256GB Uzay Siyahı',
        imageUrl: '/images/iphone.jpg',
        url: '/urun/iphone-14-pro',
        price: 64999,
        category: 'Elektronik',
        tags: ['Apple', 'Telefon', 'iOS'],
      },
      {
        id: '2',
        title: 'Samsung Galaxy S23',
        description: 'Samsung Galaxy S23 Ultra 512GB Phantom Black',
        imageUrl: '/images/samsung.jpg',
        url: '/urun/samsung-s23',
        price: 52999,
        category: 'Elektronik',
        tags: ['Samsung', 'Telefon', 'Android'],
      },
      // Daha fazla örnek sonuç eklenebilir
    ];

    setResults(mockResults);
    setLoading(false);
    setHasMore(false); // Örnek için false, gerçek uygulamada API yanıtına göre belirlenecek
  };

  const handleLoadMore = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    // Burada sayfalama için API çağrısı yapılacak
    setLoading(false);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    // Filtreleri uygulayarak yeni arama yapılacak
    handleSearch(query);
  };

  return (
    <div className="min-h-screen bg-dark-300">
      <div className="h-16" /> {/* Header için boşluk */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            onFilterClick={() => setShowFilters(true)}
            initialQuery={query}
          />
        </div>

        {showFilters && (
          <SearchFilters
            onClose={() => setShowFilters(false)}
            onApplyFilters={handleFilterChange}
          />
        )}

        <div className="mt-8">
          {query && (
            <div className="mb-4 text-gray-400">
              <span className="font-medium text-white">{results.length}</span> sonuç
              bulundu
            </div>
          )}

          <SearchResults
            results={results}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        </div>
      </main>
    </div>
  );
} 