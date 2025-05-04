'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Search, Eye, Calendar, Clock, X, Paperclip, MessageSquare } from 'lucide-react';
import Image from 'next/image';

interface SupportTicket {
  id: number;
  title: string;
  description: string;
  user_id: string;
  priority: 'Yüksek' | 'Orta' | 'Düşük';
  status: 'Açık' | 'Beklemede' | 'Kapalı';
  created_at: string;
  updated_at: string;
  attachments: string[] | null;
  user: {
    first_name: string;
    last_name: string;
  };
}

export default function DestekPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Açık' | 'Beklemede' | 'Kapalı'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Destek talepleri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // Get priority color and text
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'Yüksek':
        return { color: 'bg-red-100 text-red-800', text: 'Yüksek' };
      case 'Orta':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Orta' };
      case 'Düşük':
        return { color: 'bg-green-100 text-green-800', text: 'Düşük' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: priority || 'Belirsiz' };
    }
  };

  // Get status color and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Açık':
        return { color: 'bg-blue-100 text-blue-800', text: 'Açık' };
      case 'Beklemede':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Beklemede' };
      case 'Kapalı':
        return { color: 'bg-gray-100 text-gray-800', text: 'Kapalı' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status || 'Belirsiz' };
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${ticket.user.first_name} ${ticket.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(ticket.id).includes(searchTerm);

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && ticket.status === statusFilter;
  });

  // Özet kartları için sayıları hesapla
  const ticketCounts = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Açık').length,
    pending: tickets.filter(t => t.status === 'Beklemede').length,
    closed: tickets.filter(t => t.status === 'Kapalı').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Destek Talepleri</h1>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500">Toplam Talep</div>
          <div className="text-2xl font-bold text-gray-900">{ticketCounts.total}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500">Açık Talepler</div>
          <div className="text-2xl font-bold text-blue-600">
            {ticketCounts.open}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500">Bekleyen Talepler</div>
          <div className="text-2xl font-bold text-yellow-600">
            {ticketCounts.pending}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-sm text-gray-500">Kapalı Talepler</div>
          <div className="text-2xl font-bold text-gray-600">
            {ticketCounts.closed}
          </div>
        </div>
      </div>

      {/* Arama ve Filtreler */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Talep ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setStatusFilter('Açık')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === 'Açık'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getStatusInfo('Açık').text}
            </button>
            <button
              onClick={() => setStatusFilter('Beklemede')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === 'Beklemede'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getStatusInfo('Beklemede').text}
            </button>
            <button
              onClick={() => setStatusFilter('Kapalı')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === 'Kapalı'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getStatusInfo('Kapalı').text}
            </button>
          </div>
        </div>
      </div>

      {/* Talepler Tablosu */}
      <div className="bg-white rounded-xl shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Talep ID
              </th>
              <th className="w-[25%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Konu
              </th>
              <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Üye
              </th>
              <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Öncelik
              </th>
              <th className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                  Yükleniyor...
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                  Destek talebi bulunamadı
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{ticket.id}</div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[300px]">
                      {ticket.title}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm text-gray-900">
                      {ticket.user.first_name} {ticket.user.last_name}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">{formatDate(ticket.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">Son: {formatDate(ticket.updated_at)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      getPriorityInfo(ticket.priority).color
                    }`}>
                      {getPriorityInfo(ticket.priority).text}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      getStatusInfo(ticket.status).color
                    }`}>
                      {getStatusInfo(ticket.status).text}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setIsViewModalOpen(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group relative"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-2">
                          Görüntüle
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          // Cevap yazma işlemi için yönlendirme yapılacak
                          window.location.href = `/yonetici/destek/yanit/${ticket.id}`;
                        }}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors group relative"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-2">
                          Cevap Yaz
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Görüntüleme Modalı */}
      {isViewModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Destek Talebi Detayları</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Talep ID</label>
                  <div className="mt-1 text-sm text-gray-900">#{selectedTicket.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Üye</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedTicket.user.first_name} {selectedTicket.user.last_name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Oluşturulma Tarihi</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(selectedTicket.created_at)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Son Güncelleme</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(selectedTicket.updated_at)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Öncelik</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getPriorityInfo(selectedTicket.priority).color
                    }`}>
                      {getPriorityInfo(selectedTicket.priority).text}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Durum</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusInfo(selectedTicket.status).color
                    }`}>
                      {getStatusInfo(selectedTicket.status).text}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Konu</label>
                <div className="mt-1 text-sm text-gray-900">{selectedTicket.title}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Açıklama</label>
                <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedTicket.description}
                </div>
              </div>
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Ekler</label>
                  <div className="mt-2 space-y-2">
                    {selectedTicket.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                        <Paperclip className="w-4 h-4" />
                        <a href={attachment} target="_blank" rel="noopener noreferrer">
                          Ek {index + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 