'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Ticket, Comment } from '../types';
import { v4 as uuidv4 } from 'uuid';

const supabase = getSupabaseClient();

export default function SupportTickets({ userId }: { userId: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
  });
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Destek taleplerini getir
  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error) {
      setTickets((data || []).map((t: any) => ({
        ...t,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        comments: [],
      })));
    }
    setLoading(false);
  };

  // Yorumları getir
  const fetchComments = async (ticketId: string) => {
    setCommentLoading(prev => ({ ...prev, [ticketId]: true }));
    const { data, error } = await supabase
      .from('support_ticket_comments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('timestamp', { ascending: true });
    if (!error) {
      setComments(prev => ({
        ...prev,
        [ticketId]: (data || []).map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          content: c.content,
          timestamp: c.timestamp,
        }))
      }));
    }
    setCommentLoading(prev => ({ ...prev, [ticketId]: false }));
  };

  useEffect(() => {
    if (userId) fetchTickets();
  }, [userId]);

  // Dosya yükleme ve talep oluşturma
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsUploading(true);
    let attachments: string[] = [];
    if (file) {
      const ext = file.name.split('.').pop();
      const filePath = `support_tickets/${userId}/${uuidv4()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('attachments').upload(filePath, file);
      if (uploadError) {
        setError('Dosya yüklenemedi.');
        setIsUploading(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(filePath);
      attachments.push(publicUrl);
    }
    if (!form.title || !form.description || !form.category) {
      setError('Lütfen tüm alanları doldurun.');
      setIsUploading(false);
      return;
    }
    const { error } = await supabase.from('support_tickets').insert([{
      user_id: userId,
      title: form.title,
      description: form.description,
      category: form.category,
      priority: form.priority,
      status: 'open',
      attachments,
    }]);
    setIsUploading(false);
    if (error) {
      setError('Kayıt sırasında hata oluştu.');
    } else {
      setForm({ title: '', description: '', category: '', priority: 'medium' });
      setFile(null);
      setShowForm(false);
      fetchTickets();
    }
  };

  // Accordion aç/kapa
  const handleExpand = (ticketId: string) => {
    setExpanded(expanded === ticketId ? null : ticketId);
    if (expanded !== ticketId) fetchComments(ticketId);
  };

  // Yorum ekle
  const handleAddComment = async (ticketId: string) => {
    const content = newComment[ticketId]?.trim();
    if (!content) return;
    setCommentLoading(prev => ({ ...prev, [ticketId]: true }));
    const { error } = await supabase.from('support_ticket_comments').insert([{
      ticket_id: ticketId,
      user_id: userId,
      content,
    }]);
    if (!error) {
      setNewComment(prev => ({ ...prev, [ticketId]: '' }));
      fetchComments(ticketId);
    }
    setCommentLoading(prev => ({ ...prev, [ticketId]: false }));
  };

  // Etiket renkleri
  const statusColor = (status: string) =>
    status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
    status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
    'bg-green-500/20 text-green-400';
  const priorityColor = (priority: string) =>
    priority === 'low' ? 'bg-green-500/10 text-green-400' :
    priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
    'bg-red-500/10 text-red-400';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-100">Destek Taleplerim</h3>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md"
        >
          Yeni Talep Oluştur
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dark-200 p-4 rounded-lg border border-dark-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Başlık</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Kategori</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md"
              required
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
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md"
              required
            >
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Açıklama</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Dosya Ekle (Görsel veya PDF)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/40"
              disabled={isUploading}
            />
            {file && <span className="text-xs text-gray-400 mt-1 block">Seçilen dosya: {file.name}</span>}
            {isUploading && (
              <div className="flex items-center gap-2 mt-2 text-primary">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Dosya yükleniyor...</span>
              </div>
            )}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100"
              disabled={isUploading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md"
              disabled={isUploading}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Yükleniyor...
                </span>
              ) : (
                'Talebi Oluştur'
              )}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {loading ? (
          <div className="text-gray-400">Yükleniyor...</div>
        ) : tickets.length === 0 ? (
          <div className="text-gray-400">Henüz destek talebiniz yok.</div>
        ) : (
          tickets.map(ticket => (
            <div key={ticket.id} className="bg-dark-200 rounded-lg border border-dark-100 mb-2">
              <div
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-dark-300/50"
                onClick={() => handleExpand(ticket.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                    {ticket.title.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-100">{ticket.title}</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${statusColor(ticket.status)}`}>{
                        ticket.status === 'open' ? 'Açık' : ticket.status === 'in_progress' ? 'İşlemde' : 'Kapalı'
                      }</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${priorityColor(ticket.priority)}`}>{
                        ticket.priority === 'low' ? 'Düşük' : ticket.priority === 'medium' ? 'Orta' : 'Yüksek'
                      }</span>
                      <span className="px-2 py-1 rounded text-xs font-bold bg-gray-500/10 text-gray-300">{ticket.category}</span>
                      <span className="px-2 py-1 rounded text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded === ticket.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
              {expanded === ticket.id && (
                <div className="border-t border-dark-100 p-4 space-y-4">
                  <div>
                    <div className="text-sm text-gray-300 mb-2 font-semibold">Açıklama</div>
                    <div className="text-gray-200 mb-2">{ticket.description}</div>
                  </div>
                  {ticket.attachments && ticket.attachments.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-300 mb-2 font-semibold">Ekler</div>
                      <div className="flex flex-wrap gap-2">
                        {ticket.attachments.map((file, idx) => (
                          file.endsWith('.pdf') ? (
                            <a key={idx} href={file} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-dark-300 text-gray-300 rounded-md text-sm hover:bg-dark-400 flex items-center gap-2">
                              <span>PDF {idx + 1}</span>
                            </a>
                          ) : (
                            <a key={idx} href={file} target="_blank" rel="noopener noreferrer" className="block">
                              <img src={file} alt={`Ek ${idx + 1}`} className="w-16 h-16 object-cover rounded-md border border-dark-100" />
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-300 mb-2 font-semibold">Yorumlar</div>
                    {commentLoading[ticket.id] ? (
                      <div className="text-gray-400">Yorumlar yükleniyor...</div>
                    ) : (
                      <div className="space-y-3">
                        {(comments[ticket.id] || []).length === 0 ? (
                          <div className="text-gray-400">Henüz yorum yok.</div>
                        ) : (
                          comments[ticket.id].map((c) => (
                            <div key={c.id} className="flex items-start gap-2 bg-dark-300 p-3 rounded-md">
                              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-base">
                                {c.content.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-gray-100">{c.content}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(c.timestamp).toLocaleString('tr-TR')}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    <div className="mt-4 space-y-2">
                      <textarea
                        placeholder="Yorumunuzu yazın..."
                        value={newComment[ticket.id] || ''}
                        onChange={e => setNewComment(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md"
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleAddComment(ticket.id)}
                          disabled={commentLoading[ticket.id] || !(newComment[ticket.id]?.trim())}
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
          ))
        )}
      </div>
    </div>
  );
} 