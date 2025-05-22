'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Users, ShoppingBag, MessageSquare, TrendingUp, ChevronRight, Clock, CheckCircle2, Truck } from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  totalDealers: number;
  totalMembers: number;
  totalTickets: number;
  totalOrders: number;
  newDealers: {
    id: number;
    isim: string;
    sehir: string;
    created_at: string;
  }[];
  recentTickets: {
    id: number;
    title: string;
    status: string;
    created_at: string;
    user: {
      first_name: string;
      last_name: string;
    };
  }[];
  recentOrders: {
    id: number;
    created_at: string;
    user_id: string;
    magaza_id: number;
    montaj_bayi_id: number | null;
    durum: string;
    genel_toplam: number;
    user: {
      first_name: string;
      last_name: string;
    };
    sellers: {
      isim: string;
    };
  }[];
}

export default function YoneticiPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalDealers: 0,
    totalMembers: 0,
    totalTickets: 0,
    totalOrders: 0,
    newDealers: [],
    recentTickets: [],
    recentOrders: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Toplam bayi sayısı
      const { count: dealerCount } = await supabase
        .from('sellers')
        .select('*', { count: 'exact', head: true });

      // Toplam üye sayısı
      const { count: memberCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Toplam destek talebi sayısı
      const { count: ticketCount } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true });

      // Son eklenen bayiler
      const { data: newDealers } = await supabase
        .from('sellers')
        .select(`
          id,
          isim,
          sehir,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Son destek talepleri
      const { data: recentTickets } = await supabase
        .from('support_tickets')
        .select(`
          id,
          title,
          status,
          created_at,
          user:profiles!inner(
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Son siparişler
      const { data: recentOrders } = await supabase
        .from('siparis')
        .select(`
          *,
          user:user_id (
            first_name,
            last_name
          ),
          sellers:magaza_id (
            isim
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Toplam sipariş sayısı
      const { count: orderCount } = await supabase
        .from('siparis')
        .select('*', { count: 'exact', head: true });

      setDashboardData({
        totalDealers: dealerCount || 0,
        totalMembers: memberCount || 0,
        totalTickets: ticketCount || 0,
        totalOrders: orderCount || 0,
        newDealers: (newDealers || []) as DashboardData['newDealers'],
        recentTickets: (recentTickets || []).map(ticket => ({
          ...ticket,
          user: Array.isArray(ticket.user) ? ticket.user[0] : ticket.user
        })) as DashboardData['recentTickets'],
        recentOrders: (recentOrders || []) as DashboardData['recentOrders']
      });
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const formatParaBirimi = (tutar: number) => {
    return tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Açık':
        return 'bg-blue-100 text-blue-800';
      case 'Beklemede':
        return 'bg-yellow-100 text-yellow-800';
      case 'Kapalı':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDurumBadgeClass = (durum: string) => {
    switch (durum) {
      case 'siparis_alindi':
        return 'bg-yellow-100 text-yellow-700';
      case 'siparis_onaylandi':
        return 'bg-blue-100 text-blue-700';
      case 'siparis_hazirlaniyor':
        return 'bg-purple-100 text-purple-700';
      case 'siparis_teslimatta':
        return 'bg-indigo-100 text-indigo-700';
      case 'siparis_tamamlandi':
        return 'bg-green-100 text-green-700';
      case 'siparis_iptal':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDurumText = (durum: string, siparis?: any) => {
    switch (durum) {
      case 'siparis_alindi':
        return 'Sipariş Alındı';
      case 'siparis_onaylandi':
        return 'Onaylandı';
      case 'siparis_hazirlaniyor':
        return 'Hazırlanıyor';
      case 'siparis_teslimatta':
        return siparis?.montaj_bayi_id === null ? 'Sipariş Kargoda' : 'Montaja Hazır';
      case 'siparis_tamamlandi':
        return 'Tamamlandı';
      case 'siparis_iptal':
        return 'İptal Edildi';
      default:
        return durum;
    }
  };

  return (
    <div className="space-y-6">
      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Toplam Bayi</div>
              <div className="text-2xl font-bold text-gray-900">{dashboardData.totalDealers}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Toplam Üye</div>
              <div className="text-2xl font-bold text-gray-900">{dashboardData.totalMembers}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <MessageSquare className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Destek Talepleri</div>
              <div className="text-2xl font-bold text-gray-900">{dashboardData.totalTickets}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-purple-50 p-3 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Toplam Sipariş</div>
              <div className="text-2xl font-bold text-gray-900">{dashboardData.totalOrders}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yeni Eklenen Bayiler */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 flex items-center justify-between border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Yeni Eklenen Bayiler</h2>
            <Link 
              href="/yonetici/bayiler"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors"
            >
              Tümünü Gör
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-6 text-center text-gray-700">Yükleniyor...</div>
            ) : dashboardData.newDealers.length === 0 ? (
              <div className="p-6 text-center text-gray-700">Henüz bayi eklenmemiş</div>
            ) : (
              dashboardData.newDealers.map((dealer) => (
                <div key={dealer.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{dealer.isim}</div>
                      <div className="text-sm text-gray-700">
                        {dealer.sehir}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">{formatDate(dealer.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Son Destek Talepleri */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 flex items-center justify-between border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Son Destek Talepleri</h2>
            <Link 
              href="/yonetici/destek"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors"
            >
              Tümünü Gör
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-6 text-center text-gray-700">Yükleniyor...</div>
            ) : dashboardData.recentTickets.length === 0 ? (
              <div className="p-6 text-center text-gray-700">Henüz destek talebi yok</div>
            ) : (
              dashboardData.recentTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{ticket.title}</div>
                      <div className="text-sm text-gray-700">
                        {ticket.user?.first_name} {ticket.user?.last_name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(ticket.status)
                      }`}>
                        {ticket.status}
                      </span>
                      <div className="text-sm font-medium text-gray-700">{formatDate(ticket.created_at)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Son Siparişler */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
          <div className="p-6 flex items-center justify-between border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Son Siparişler</h2>
            <Link 
              href="/yonetici/siparisler"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors"
            >
              Tümünü Gör
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Sipariş No</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Müşteri</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Bayi</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Tarih</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Tutar</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : dashboardData.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Henüz sipariş bulunmuyor
                    </td>
                  </tr>
                ) : (
                  dashboardData.recentOrders.map((siparis) => (
                    <tr key={siparis.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        #{siparis.id}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {siparis.user.first_name} {siparis.user.last_name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {siparis.sellers.isim}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {formatDate(siparis.created_at)}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {formatParaBirimi(siparis.genel_toplam)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getDurumBadgeClass(siparis.durum)}`}>
                          {getDurumText(siparis.durum, siparis)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 