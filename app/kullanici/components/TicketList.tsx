'use client';

import { useState } from 'react';
import { Ticket } from '../types';

interface TicketListProps {
  tickets: Ticket[];
  onAddComment: (ticketId: string, comment: string) => void;
}

export default function TicketList({ tickets, onAddComment }: TicketListProps) {
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (ticketId: string) => {
    if (newComment.trim()) {
      onAddComment(ticketId, newComment);
      setNewComment('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500';
      case 'resolved':
        return 'bg-green-500/10 text-green-500';
      case 'closed':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-500/10 text-green-500';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'high':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="bg-dark-200 rounded-lg border border-dark-100 p-4"
        >
          <div
            className="flex justify-between items-start cursor-pointer"
            onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
          >
            <div>
              <h3 className="text-lg font-medium text-gray-100">{ticket.title}</h3>
              <p className="text-sm text-gray-400 mt-1">{ticket.description}</p>
            </div>
            <div className="flex space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status === 'open' && 'Açık'}
                {ticket.status === 'in_progress' && 'İşlemde'}
                {ticket.status === 'resolved' && 'Çözüldü'}
                {ticket.status === 'closed' && 'Kapalı'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority === 'low' && 'Düşük'}
                {ticket.priority === 'medium' && 'Orta'}
                {ticket.priority === 'high' && 'Yüksek'}
              </span>
            </div>
          </div>

          {expandedTicket === ticket.id && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center text-sm text-gray-400">
                <span>Kategori: {ticket.category}</span>
                <span className="mx-2">•</span>
                <span>Oluşturulma: {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}</span>
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

                <div className="mt-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Yorumunuzu yazın..."
                    className="w-full px-3 py-2 bg-dark-300 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                  <button
                    onClick={() => handleAddComment(ticket.id)}
                    className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Yorum Ekle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 