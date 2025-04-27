import { useState } from 'react';
import { X } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface SearchFiltersProps {
  onClose: () => void;
  onApplyFilters: (filters: SearchFilters) => void;
}

interface SearchFilters {
  categories: string[];
  dateRange: string;
  tags: string[];
  sortBy: string;
}

const categories: FilterOption[] = [
  { id: '1', label: 'Elektronik', value: 'electronics' },
  { id: '2', label: 'Giyim', value: 'clothing' },
  { id: '3', label: 'Kitaplar', value: 'books' },
  { id: '4', label: 'Spor', value: 'sports' },
];

const dateRanges: FilterOption[] = [
  { id: '1', label: 'Son 24 saat', value: '24h' },
  { id: '2', label: 'Son 7 gün', value: '7d' },
  { id: '3', label: 'Son 30 gün', value: '30d' },
  { id: '4', label: 'Tüm zamanlar', value: 'all' },
];

const sortOptions: FilterOption[] = [
  { id: '1', label: 'Alakalılık', value: 'relevance' },
  { id: '2', label: 'En yeni', value: 'newest' },
  { id: '3', label: 'En popüler', value: 'popular' },
];

const popularTags: FilterOption[] = [
  { id: '1', label: 'İndirim', value: 'discount' },
  { id: '2', label: 'Yeni Sezon', value: 'new-season' },
  { id: '3', label: 'Ücretsiz Kargo', value: 'free-shipping' },
];

export default function SearchFilters({ onClose, onApplyFilters }: SearchFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState('relevance');

  const handleApply = () => {
    onApplyFilters({
      categories: selectedCategories,
      dateRange: selectedDateRange,
      tags: selectedTags,
      sortBy: selectedSort,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedDateRange('all');
    setSelectedTags([]);
    setSelectedSort('relevance');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-end">
      <div className="w-96 bg-dark-200 h-full overflow-y-auto">
        <div className="p-4 border-b border-dark-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Filtreler</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-100 rounded-full"
          >
            <X className="h-5 w-5 text-primary" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Sıralama */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Sıralama</h3>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <label key={option.id} className="flex items-center">
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={selectedSort === option.value}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="form-radio text-primary focus:ring-primary h-4 w-4 bg-dark-100 border-dark-50"
                  />
                  <span className="ml-2 text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Kategoriler */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Kategoriler</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategories([...selectedCategories, category.value]);
                      } else {
                        setSelectedCategories(selectedCategories.filter((c) => c !== category.value));
                      }
                    }}
                    className="form-checkbox text-primary focus:ring-primary h-4 w-4 bg-dark-100 border-dark-50"
                  />
                  <span className="ml-2 text-gray-300">{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tarih Aralığı */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Tarih Aralığı</h3>
            <div className="space-y-2">
              {dateRanges.map((range) => (
                <label key={range.id} className="flex items-center">
                  <input
                    type="radio"
                    name="dateRange"
                    value={range.value}
                    checked={selectedDateRange === range.value}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                    className="form-radio text-primary focus:ring-primary h-4 w-4 bg-dark-100 border-dark-50"
                  />
                  <span className="ml-2 text-gray-300">{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Etiketler */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Popüler Etiketler</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    if (selectedTags.includes(tag.value)) {
                      setSelectedTags(selectedTags.filter((t) => t !== tag.value));
                    } else {
                      setSelectedTags([...selectedTags, tag.value]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag.value)
                      ? 'bg-primary text-white'
                      : 'bg-dark-100 text-gray-300 hover:bg-dark-50'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-dark-100 flex justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white"
          >
            Sıfırla
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Uygula
          </button>
        </div>
      </div>
    </div>
  );
} 