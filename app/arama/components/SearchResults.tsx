import { useEffect, useRef, useState } from 'react';
import { SearchResult } from '../types';
import Image from 'next/image';

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function SearchResults({ results, loading, hasMore, onLoadMore }: SearchResultsProps) {
  const [lastElement, setLastElement] = useState<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (lastElement) {
      observer.current.observe(lastElement);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [lastElement, hasMore, loading, onLoadMore]);

  if (results.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Sonuç bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {results.map((result, index) => (
        <div
          key={result.id}
          ref={index === results.length - 1 ? setLastElement : null}
          className="bg-dark-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-dark-100"
        >
          <div className="relative h-48 w-full">
            {result.imageUrl ? (
              <Image
                src={result.imageUrl}
                alt={result.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-dark-100 flex items-center justify-center">
                <span className="text-gray-400">Görsel yok</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{result.title}</h3>
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{result.description}</p>
            {result.price && (
              <p className="text-primary font-semibold mb-2">
                {result.price.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                })}
              </p>
            )}
            {result.category && (
              <span className="inline-block bg-dark-100 text-gray-300 text-xs px-2 py-1 rounded mb-2">
                {result.category}
              </span>
            )}
            {result.tags && result.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {result.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-dark-100 text-gray-300 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      {loading && (
        <div className="col-span-full flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
} 