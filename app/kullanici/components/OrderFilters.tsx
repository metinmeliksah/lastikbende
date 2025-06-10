'use client';

import { useState } from 'react';

interface OrderFiltersProps {
  onFilterChange: (filters: {
    status: string;
    dateRange: string;
  }) => void;
}

export default function OrderFilters({ onFilterChange }: OrderFiltersProps) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    onFilterChange({
      status,
      dateRange: selectedDateRange
    });
  };

  const handleDateRangeChange = (dateRange: string) => {
    setSelectedDateRange(dateRange);
    onFilterChange({
      status: selectedStatus,
      dateRange
    });
  };

  const statusOptions = [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'siparis_alindi', label: 'Sipariş Alındı' },
    { value: 'siparis_onaylandi', label: 'Onaylandı' },
    { value: 'siparis_hazirlaniyor', label: 'Hazırlanıyor' },
    { value: 'siparis_teslimatta', label: 'Kargoda' },
    { value: 'siparis_tamamlandi', label: 'Tamamlandı' },
    { value: 'siparis_iptal', label: 'İptal Edildi' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Tüm Zamanlar' },
    { value: 'today', label: 'Bugün' },
    { value: 'week', label: 'Bu Hafta' },
    { value: 'month', label: 'Bu Ay' },
    { value: 'quarter', label: 'Son 3 Ay' },
    { value: 'year', label: 'Bu Yıl' }
  ];

  return (
    <div className="bg-dark-300 rounded-lg p-4 border border-dark-100">
      <h3 className="text-lg font-medium text-gray-100 mb-4">Filtreler</h3>
      
      <div className="space-y-4">
        {/* Durum Filtresi */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sipariş Durumu
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full bg-dark-400 border border-dark-100 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-dark-400 text-gray-100">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tarih Aralığı Filtresi */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tarih Aralığı
          </label>
          <select
            value={selectedDateRange}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            className="w-full bg-dark-400 border border-dark-100 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-dark-400 text-gray-100">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sıfırlama Butonu */}
        <button
          onClick={() => {
            setSelectedStatus('all');
            setSelectedDateRange('all');
            onFilterChange({ status: 'all', dateRange: 'all' });
          }}
          className="w-full bg-dark-400 hover:bg-red-600 text-gray-300 hover:text-white py-2 px-4 rounded-lg transition-colors border border-dark-100 hover:border-red-600"
        >
          Filtreleri Sıfırla
        </button>
      </div>
    </div>
  );
} 