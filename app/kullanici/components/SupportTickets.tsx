'use client';

import { useState } from 'react';
import { Ticket } from '../types';

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '1',
      title: 'Siparişim henüz gelmedi',
      description: '2 gün önce verdiğim sipariş henüz gelmedi. Takip numarası: TR123456789',
      category: 'Sipariş',
      priority: 'high',
      status: 'open',
      createdAt: '2024-03-15T10:00:00Z',
      updatedAt: '2024-03-15T10:00:00Z',
      comments: [
        {
          id: '1',
          userId: '123',
          content: 'Siparişiniz kargoya verildi, en geç yarın elinizde olacaktır.',
          timestamp: '2024-03-15T11:00:00Z'
        }
      ]
    },
    {
      id: '2',
      title: 'Ürün hasarlı geldi',
      description: 'Sipariş ettiğim ürün kutusu hasarlı geldi. Fotoğraflar ekte.',
      category: 'İade/Değişim',
      priority: 'medium',
      status: 'in_progress',
      createdAt: '2024-03-14T15:30:00Z',
      updatedAt: '2024-03-14T15:30:00Z',
      attachments: ['hasar1.jpg', 'hasar2.jpg'],
      comments: [
        {
          id: '2',
          userId: '123',
          content: 'Üzgünüz, yeni ürün gönderimi için talep oluşturuldu.',
          timestamp: '2024-03-14T16:00:00Z'
        }
      ]
    }
  ]);

  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [expandedTickets, setExpandedTickets] = useState<{ [key: string]: boolean }>({});
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const toggleTicket = (ticketId: string) => {
    setExpandedTickets(prev => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  const handleAddComment = (ticketId: string) => {
    const comment = comments[ticketId];
    if (!comment?.trim()) return;

    setTickets(tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          comments: [
            ...ticket.comments,
            {
              id: Date.now().toString(),
              userId: '123', // Gerçek uygulamada kullanıcı ID'si kullanılmalı
              content: comment,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return ticket;
    }));
    
    // Yorum gönderildikten sonra input'u temizle
    setComments(prev => ({ ...prev, [ticketId]: '' }));
  };

  const handleCreateTicket = () => {
    if (newTicket.title && newTicket.description && newTicket.category) {
      const ticket: Ticket = {
        id: Date.now().toString(),
        ...newTicket,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: []
      };
      setTickets([ticket, ...tickets]);
      setShowNewTicketForm(false);
      setNewTicket({
        title: '',
        description: '',
        category: '',
        priority: 'medium'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-100">Destek Taleplerim</h3>
        <button
          onClick={() => setShowNewTicketForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md"
        >
          Yeni Talep Oluştur
        </button>
      </div>

      {showNewTicketForm && (
        <div className="bg-dark-200 p-4 rounded-lg border border-dark-100">
          <h4 className="text-lg font-medium text-gray-100 mb-4">Yeni Destek Talebi</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Başlık</label>
              <input
                type="text"
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Kategori</label>
              <select
                value={newTicket.category}
                onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Seçiniz</option>
                <option value="Sipariş">Sipariş</option>
                <option value="İade/Değişim">İade/Değişim</option>
                <option value="Ürün Bilgisi">Ürün Bilgisi</option>
                <option value="Hesap">Hesap</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Öncelik</label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Açıklama</label>
              <textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowNewTicketForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100"
              >
                İptal
              </button>
              <button
                onClick={handleCreateTicket}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md"
              >
                Talebi Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {tickets.map((ticket) => (
          <div 
            key={ticket.id} 
            className="bg-dark-200 rounded-lg border border-dark-100 overflow-hidden transition-all duration-200 ease-in-out"
          >
            <div 
              onClick={() => toggleTicket(ticket.id)}
              className="p-4 cursor-pointer hover:bg-dark-300/50 flex justify-between items-start"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-base font-medium text-gray-100">{ticket.title}</h4>
                  <span className="text-xs text-gray-400">
                    {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1 line-clamp-1">{ticket.description}</p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ticket.status === 'open' ? 'bg-yellow-500/10 text-yellow-500' :
                  ticket.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' :
                  ticket.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                  'bg-gray-500/10 text-gray-500'
                }`}>
                  {ticket.status === 'open' && 'Açık'}
                  {ticket.status === 'in_progress' && 'İşlemde'}
                  {ticket.status === 'resolved' && 'Çözüldü'}
                  {ticket.status === 'closed' && 'Kapalı'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ticket.priority === 'low' ? 'bg-green-500/10 text-green-500' :
                  ticket.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {ticket.priority === 'low' && 'Düşük'}
                  {ticket.priority === 'medium' && 'Orta'}
                  {ticket.priority === 'high' && 'Yüksek'}
                </span>
              </div>
            </div>

            {expandedTickets[ticket.id] && (
              <div className="border-t border-dark-100 p-4 space-y-4">
                <div className="flex items-center text-sm text-gray-400">
                  <span>Kategori: {ticket.category}</span>
                </div>

                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Ekler</h4>
                    <div className="flex flex-wrap gap-2">
                      {ticket.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-dark-300 text-gray-300 rounded-md text-sm hover:bg-dark-400"
                        >
                          Dosya {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Yorumlar</h4>
                  <div className="space-y-3">
                    {ticket.comments.map((comment) => (
                      <div key={comment.id} className="bg-dark-300 p-3 rounded-md">
                        <p className="text-gray-100">{comment.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(comment.timestamp).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    <textarea
                      placeholder="Yorumunuzu yazın..."
                      value={comments[ticket.id] || ''}
                      onChange={(e) => setComments(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                      className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleAddComment(ticket.id)}
                        disabled={!comments[ticket.id]?.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                      >
                        Yorum Gönder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 