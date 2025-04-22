'use client';

import { useState } from 'react';

interface NewTicketFormProps {
  onSubmit: (formData: {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    attachments?: string[];
  }) => void;
  onCancel: () => void;
}

export default function NewTicketForm({ onSubmit, onCancel }: NewTicketFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [attachments, setAttachments] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      category,
      priority,
      attachments: attachments.length > 0 ? attachments : undefined
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setAttachments([...attachments, ...fileNames]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-100 mb-6">Yeni Destek Talebi</h2>
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
          Başlık
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
          Kategori
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
        <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">
          Öncelik
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="low">Düşük</option>
          <option value="medium">Orta</option>
          <option value="high">Yüksek</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          Açıklama
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label htmlFor="attachments" className="block text-sm font-medium text-gray-300 mb-1">
          Ekler
        </label>
        <input
          type="file"
          id="attachments"
          multiple
          onChange={handleFileUpload}
          className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {attachments.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-400">Seçilen dosyalar:</p>
            <ul className="list-disc list-inside text-sm text-gray-400">
              {attachments.map((file, index) => (
                <li key={index}>{file}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 hover:text-gray-100"
        >
          İptal
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Talebi Oluştur
        </button>
      </div>
    </form>
  );
} 