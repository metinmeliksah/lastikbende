import { useState, useEffect, useRef } from 'react';
import { Search, X, Filter } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterClick: () => void;
  initialQuery?: string;
}

interface Suggestion {
  id: string;
  text: string;
  type: 'history' | 'popular' | 'suggestion';
}

export default function SearchBar({ onSearch, onFilterClick, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Önerileri güncelle
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    // Örnek öneriler - gerçek uygulamada API'den gelecek
    const mockSuggestions: Suggestion[] = [
      { id: '1', text: `${query} araması`, type: 'history' },
      { id: '2', text: `${query} fiyatları`, type: 'popular' },
      { id: '3', text: `${query} modelleri`, type: 'suggestion' },
    ];

    setSuggestions(mockSuggestions);
  }, [query]);

  // Dışarı tıklamada önerileri kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.text);
    onSearch(suggestion.text);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-primary h-5 w-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Ne aramıştınız?"
            className="w-full pl-12 pr-20 py-3 rounded-full bg-dark-200 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary border border-dark-100"
          />
          <div className="absolute right-0 flex items-center space-x-2 mr-4">
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 hover:bg-dark-100 rounded-full"
              >
                <X className="h-5 w-5 text-primary" />
              </button>
            )}
            <button
              type="button"
              onClick={onFilterClick}
              className="p-1 hover:bg-dark-100 rounded-full"
            >
              <Filter className="h-5 w-5 text-primary" />
            </button>
          </div>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute w-full mt-2 bg-dark-200 rounded-lg shadow-lg border border-dark-100 z-10">
          <ul className="py-2">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 hover:bg-dark-100 cursor-pointer flex items-center"
              >
                <Search className="h-4 w-4 text-primary mr-2" />
                <span className="text-white">{suggestion.text}</span>
                {suggestion.type === 'history' && (
                  <span className="ml-auto text-xs text-gray-400">Geçmiş</span>
                )}
                {suggestion.type === 'popular' && (
                  <span className="ml-auto text-xs text-gray-400">Popüler</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 