'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Search, Eye, Calendar, Clock, X, Paperclip, MessageSquare, Archive, RefreshCw } from 'lucide-react';
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

  // Durum güncelleme fonksiyonu
  const handleStatusChange = async (ticketId: number, newStatus: 'Açık' | 'Beklemede' | 'Kapalı') => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;
      
      // Başarılı güncelleme sonrası verileri yeniden çek
      await fetchTickets();
      
      // Modalda görüntülenen bileti güncelle
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({...selectedTicket, status: newStatus});
      }
      
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      alert('Durum güncellenirken bir hata oluştu.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Destek Talepleri</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Talep ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm w-full sm:w-64 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Açık' | 'Beklemede' | 'Kapalı')}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors cursor-pointer"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="Açık">Açık</option>
            <option value="Beklemede">Beklemede</option>
            <option value="Kapalı">Kapalı</option>
          </select>
        </div>
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

      {/* Destek Talepleri Tablosu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Talep No</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Konu</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Müşteri</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Tarih</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Durum</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-900">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-700">
                    Destek talebi bulunamadı
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-gray-900">#{ticket.id}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{ticket.title}</div>
                      <div className="text-sm text-gray-700 mt-0.5">{ticket.description.substring(0, 100)}...</div>
                    </td>
                    <td className="py-4 px-6 text-gray-900">{ticket.user.first_name} {ticket.user.last_name}</td>
                    <td className="py-4 px-6 text-gray-700">
                      {new Date(ticket.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(ticket.status).color}`}>
                        {getStatusInfo(ticket.status).text}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                          title="Detay"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {ticket.attachments && ticket.attachments.length > 0 && (
                          <button
                            onClick={() => {
                              // Cevap yazma işlemi için yönlendirme yapılacak
                              window.location.href = `/yonetici/destek/yanit/${ticket.id}`;
                            }}
                            className="p-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Ekler"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>
                        )}
                        {ticket.status !== 'Kapalı' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(ticket.id, 'Beklemede')}
                              className="p-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                              title="Beklemede"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(ticket.id, 'Kapalı')}
                              className="p-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                              title="Tamamla"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {ticket.status === 'Kapalı' && (
                          <button
                            onClick={() => handleStatusChange(ticket.id, 'Açık')}
                            className="p-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                            title="Yeniden Aç"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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