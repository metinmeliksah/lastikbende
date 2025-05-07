'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Ticket, Comment } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function SupportTickets({ userId }: { userId: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('supportTicketForm');
      if (saved) return JSON.parse(saved);
    }
    return {
      title: '',
      description: '',
      category: '',
      priority: 'medium',
    };
  });
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  // Açıklama için devamını oku fonksiyonu
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const descriptionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleDescription = (ticketId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [ticketId]: !prev[ticketId]
    }));
  };

  const shouldShowReadMore = (ticketId: string) => {
    const element = descriptionRefs.current[ticketId];
    return element ? element.scrollHeight > element.clientHeight : false;
  };

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

  useEffect(() => {
    localStorage.setItem('supportTicketForm', JSON.stringify(form));
  }, [form]);

  // Siparişten destek talebi için otomatik form doldurma
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const orderData = localStorage.getItem('supportTicketOrder');
      if (orderData) {
        const order = JSON.parse(orderData);
        setShowForm(true);
        setForm({
          title: `Sipariş #${order.orderId} için destek`,
          category: 'Sipariş',
          priority: 'medium',
          description: `Sipariş Tarihi: ${order.orderDate}\nDurum: ${order.orderStatus}\nÜrünler:\n${order.orderItems.map((item: any) => `- ${item.name} x${item.quantity}`).join('\n')}\n\nLütfen yaşadığınız sorunu detaylandırınız.`,
        });
        localStorage.removeItem('supportTicketOrder');
      }
    }
  }, []);

  // Form validasyonu
  const isFormValid = form.title.trim() !== '' && 
                     form.category !== '' && 
                     form.priority !== '' &&
                     form.description.trim() !== '';

  // Dosya yükleme ve talep oluşturma
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsUploading(true);
    setUploadProgress(0);
    let attachments: string[] = [];

    try {
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileUrl = await uploadToCloudinary(file);
          attachments.push(fileUrl);
          setUploadProgress(((i + 1) / files.length) * 100);
        }
      }

      if (!isFormValid) {
        setError('Lütfen zorunlu alanları doldurun.');
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

      if (error) {
        setError('Kayıt sırasında hata oluştu.');
      } else {
        setForm({ title: '', description: '', category: '', priority: 'medium' });
        localStorage.removeItem('supportTicketForm');
        setFiles([]);
        setShowForm(false);
        fetchTickets();
      }
    } catch (err) {
      setError('Dosya yükleme sırasında bir hata oluştu.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Dosya seçme işleyicisi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  // Dosya kaldırma işleyicisi
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Başlık <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm((f: typeof form) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={e => setForm((f: typeof form) => ({ ...f, category: e.target.value }))}
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
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Öncelik <span className="text-red-500">*</span>
            </label>
            <select
              value={form.priority}
              onChange={e => setForm((f: typeof form) => ({ ...f, priority: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md"
              required
            >
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Açıklama <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm((f: typeof form) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md"
              required
            />
          </div>

          {/* Modern Dosya Yükleme Alanı */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Dosya Ekle (Görsel veya PDF)</label>
            <div className="border-2 border-dashed border-dark-300 rounded-lg p-6 hover:border-primary/50 transition-colors">
              <div className="text-center">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  multiple
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Dosya Seç</span>
                </label>
                <p className="mt-2 text-sm text-gray-400">veya dosyaları buraya sürükleyin</p>
              </div>

              {/* Seçilen Dosyalar */}
              {files.length > 0 && (
                <div className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {files.map((file, index) => (
                      <div key={index} className="group relative bg-dark-300 rounded-lg overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <div className="aspect-square">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square flex items-center justify-center bg-dark-400">
                            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-2">
                          <p className="text-sm text-gray-300 truncate">{file.name}</p>
                          <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Yükleme İlerlemesi */}
          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>Dosyalar yükleniyor...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-dark-300 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

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
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUploading || !isFormValid}
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
            <div key={ticket.id} className="bg-dark-200 rounded-lg border border-dark-100">
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
                  {/* Açıklama Bölümü */}
                  <div>
                    <div className="text-sm text-gray-300 mb-2 font-semibold">Açıklama</div>
                    <div
                      ref={el => descriptionRefs.current[ticket.id] = el}
                      className={`text-gray-200 mb-2 ${!expandedDescriptions[ticket.id] ? 'line-clamp-3' : ''}`}
                    >
                      {ticket.description}
                    </div>
                    {shouldShowReadMore(ticket.id) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDescription(ticket.id);
                        }}
                        className="text-primary hover:text-primary/80 text-sm"
                      >
                        {expandedDescriptions[ticket.id] ? 'Daha az göster' : 'Devamını oku'}
                      </button>
                    )}
                  </div>

                  {/* Ekler Bölümü */}
                  {ticket.attachments && ticket.attachments.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-300 mb-2 font-semibold">Ekler</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {ticket.attachments.map((file, idx) => (
                          <a
                            key={idx}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative bg-dark-300 rounded-lg overflow-hidden aspect-square"
                          >
                            {file.endsWith('.pdf') ? (
                              <div className="h-full flex items-center justify-center bg-dark-400">
                                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                            ) : (
                              <img
                                src={file}
                                alt={`Ek ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-sm">Görüntüle</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Yorumlar Bölümü */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-300 font-semibold">Yorumlar</div>
                      <div className="text-xs text-gray-400">
                        {comments[ticket.id]?.length || 0} yorum
                      </div>
                    </div>
                    {commentLoading[ticket.id] ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(comments[ticket.id] || []).length === 0 ? (
                          <div className="text-center py-4 text-gray-400">
                            Henüz yorum yok. İlk yorumu siz yapın!
                          </div>
                        ) : (
                          comments[ticket.id].map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                  {comment.content.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="bg-dark-300 rounded-lg p-3">
                                  <p className="text-gray-100">{comment.content}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-400">
                                    {new Date(comment.timestamp).toLocaleString('tr-TR')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    <div className="mt-4">
                      <textarea
                        placeholder="Yorumunuzu yazın..."
                        value={newComment[ticket.id] || ''}
                        onChange={e => setNewComment(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => handleAddComment(ticket.id)}
                          disabled={commentLoading[ticket.id] || !(newComment[ticket.id]?.trim())}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md flex items-center gap-2"
                        >
                          {commentLoading[ticket.id] ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Gönderiliyor...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                              <span>Yorum Gönder</span>
                            </>
                          )}
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