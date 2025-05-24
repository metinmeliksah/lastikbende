'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    dateRange: 'all',
    tags: [],
    sortBy: 'relevance',
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      // Burada arama sonuçlarını getiren API çağrısı yapılacak
      // Örnek: const { data } = await supabase.from('products').textSearch('name', query)
      setLoading(false);
    };

    if (query) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/arama?q=${encodeURIComponent(searchQuery.trim())}`);
    }
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
    if (searchQuery.trim()) {
      router.push(`/arama?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-dark-400">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex items-center bg-dark-300 rounded-lg p-2 border border-dark-100">
              <input
                type="text"
                placeholder="Arama yapın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-gray-300 placeholder-gray-500 focus:outline-none px-2"
              />
              <button 
                type="submit"
                className="p-2 text-gray-300 hover:text-primary transition-colors duration-200"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4">
          {query && (
            <h1 className="text-2xl font-bold text-gray-100 mb-6">
              "{query}" için arama sonuçları
            </h1>
          )}
          
          {loading ? (
            <div className="text-gray-300">Yükleniyor...</div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Arama sonuçları burada listelenecek */}
            </div>
          ) : (
            <div className="text-center text-gray-300">
              {query ? 'Sonuç bulunamadı.' : 'Arama yapmak için yukarıdaki arama kutusunu kullanın.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 