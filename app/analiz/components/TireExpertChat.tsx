import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sendChatMessage, ChatMessage } from '../services/chatService';
import { AnalysisResult, FormData } from '../types';
import { formatAnalysisReport, generateReportSummary } from '../services/reportService';
import './TireExpertChat.css';

// Sohbet geçmişi için maksimum mesaj sayısı
const MAX_CONVERSATION_MESSAGES = 50;

// Message türünü yerel olarak tanımlayalım
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface TireExpertChatProps {
  analysisResults: AnalysisResult | null;
  formData: FormData;
}

const TireExpertChat: React.FC<TireExpertChatProps> = ({ 
  analysisResults, 
  formData 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Merhaba, ben Lastik Uzmanınız. Size lastik bakımı ve güvenliği konusunda yardımcı olabilirim. Size nasıl yardımcı olabilirim?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState<string | null>(null);
  const [typingIndex, setTypingIndex] = useState(0);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // Chat penceresi açıldığında, kısa bir süre sonra input alanına fokuslan
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // Animasyon tamamlandıktan sonra fokuslanması için kısa bir gecikme
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Yazma sırasında her 20 karakterde bir kaydırma için
  useEffect(() => {
    if (typingIndex > 0 && typingIndex % 20 === 0) {
      scrollToBottom();
    }
  }, [typingIndex]);

  // Yazma animasyonu için useEffect
  useEffect(() => {
    if (typingMessage !== null) {
      if (typingIndex < typingMessage.length) {
        const timeout = setTimeout(() => {
          setTypingIndex(typingIndex + 1);
        }, 15); // Yazma hızı

        return () => clearTimeout(timeout);
      } else {
        // Yazma tamamlandığında
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.isTyping) {
            lastMessage.isTyping = false;
            // Mesaj içeriğini tam metinle güncelle
            lastMessage.content = typingMessage;
          }
          return newMessages;
        });
        setTypingMessage(null);
        setTypingIndex(0);
        
        // Yazma tamamlandığında sayfayı aşağı kaydır
        setTimeout(() => {
          scrollToBottom();
          // Metin kutusuna odaklan
          inputRef.current?.focus();
        }, 100);
      }
    }
  }, [typingMessage, typingIndex]);

  // Sohbet geçmişini sınırlandırma yardımcı fonksiyonu
  const limitConversationHistory = (messages: Message[]): Message[] => {
    if (messages.length <= MAX_CONVERSATION_MESSAGES) {
      return messages;
    }
    
    // Sadece son N mesajı al
    return messages.slice(messages.length - MAX_CONVERSATION_MESSAGES);
  };

  // API için mesajları hazırlama yardımcı fonksiyonu
  const prepareMessagesForAPI = (
    messages: Message[], 
    systemMessage: string,
    includeLatestMessage?: { role: 'user', content: string }
  ): ChatMessage[] => {
    // Önce sistem talimatını ekle
    const apiMessages: ChatMessage[] = [
      {
        role: 'system',
        content: systemMessage,
      }
    ];
    
    // Sınırlandırılmış mesaj geçmişini ekle
    const limitedMessages = limitConversationHistory(messages);
    
    limitedMessages.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        apiMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });
    
    // Eğer dahil edilecek ek bir mesaj varsa ekle
    if (includeLatestMessage) {
      apiMessages.push(includeLatestMessage);
    }
    
    return apiMessages;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Sistem talimatı
      const systemMessage = 'Sen bir lastik uzmanısın. Lastik bakımı, güvenliği ve analizi konusunda uzmanlık bilgisi sağlıyorsun. Türkçe olarak yanıt ver. Kullanıcının lastik durumu hakkında sorduğu sorulara profesyonel ve anlayışlı bir dille cevap ver. Yazım formatında markdown kullan, önemli bilgileri **kalın** yap, listeleri numaralı şekilde göster. Konuşma geçmişindeki tüm mesajları dikkate al ve kullanıcının sorularına önceki konuşmalardan bilgileri kullanarak cevap ver.';
      
      // API için mesajları hazırla
      const apiMessages = prepareMessagesForAPI(
        messages, 
        systemMessage,
        { role: 'user', content: inputMessage }
      );

      console.log('Sending chat history to API:', apiMessages);
      const response = await sendChatMessage(apiMessages);

      if (response.success) {
        // Yazma animasyonu için boş bir mesaj ekle
        const typingMessage: Message = {
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isTyping: true,
        };
        
        setMessages((prev) => [...prev, typingMessage]);
        
        // Yazma animasyonu için
        setTypingMessage(response.message);
        setTypingIndex(0);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareAnalysis = async () => {
    if (!analysisResults) return;

    setIsLoading(true);
    
    try {
      const formattedReport = formatAnalysisReport(analysisResults, formData);
      const reportSummary = generateReportSummary(formattedReport, formData);
      
      const analysisMessage: Message = {
        role: 'user',
        content: `Lastik analiz raporumu seninle paylaşıyorum:\n\n${reportSummary}`,
        timestamp: new Date(),
      };
  
      setMessages((prev) => [...prev, analysisMessage]);
  
      // Sistem talimatı
      const systemMessage = 'Sen bir lastik uzmanısın. Lastik bakımı, güvenliği ve analizi konusunda uzmanlık bilgisi sağlıyorsun. Türkçe olarak yanıt ver. Kullanıcının paylaştığı lastik analiz raporunu incele ve değerlendir. Önemli sorunları vurgula, bakım önerileri sun ve güvenlikle ilgili tavsiyelerde bulun. Yazım formatında markdown kullan, önemli bilgileri **kalın** yap, listeleri numaralı veya madde işaretli şekilde göster. Konuşma geçmişindeki tüm mesajları dikkate al ve analiz raporunu değerlendirirken önceki konuşmalardan edindiğin bilgileri de kullan.';
      
      // API için mesajları hazırla
      const chatMessages = prepareMessagesForAPI(
        messages, 
        systemMessage,
        { role: 'user', content: `Lastik analiz raporumu seninle paylaşıyorum:\n\n${reportSummary}` }
      );
  
      console.log('Sending analysis with chat history to API:', chatMessages);
      const response = await sendChatMessage(chatMessages);
  
      if (response.success) {
        // Yazma animasyonu için boş bir mesaj ekle
        const typingMessage: Message = {
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isTyping: true,
        };
        
        setMessages((prev) => [...prev, typingMessage]);
        
        // Yazma animasyonu için
        setTypingMessage(response.message);
        setTypingIndex(0);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Üzgünüm, analiz raporunuzu değerlendirirken bir hata oluştu.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Üzgünüm, analiz raporunuzu değerlendirirken bir hata oluştu.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Analiz raporunu paylaştıktan sonra, kullanıcı kolaylıkla soru sorabilsin diye input alanına fokuslanıyoruz
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Markdown benzeri metin formatlaması için yardımcı fonksiyon
  const formatMessage = (content: string) => {
    // Bold formatlaması (**text**)
    const boldFormatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Numaralı listeler (1. item)
    let listFormatted = boldFormatted.replace(/(\d+\.\s.*?)(?=\n\d+\.|\n\n|$)/g, '<li>$1</li>');
    if (listFormatted.includes('<li>')) {
      listFormatted = listFormatted.replace(/((?:<li>.*?<\/li>\n?)+)/g, '<ol>$1</ol>');
    }
    
    // Madde işaretli listeler (- item veya * item)
    let bulletFormatted = listFormatted.replace(/(?:^|\n)[\-\*]\s+(.*?)(?=\n[\-\*]|\n\n|$)/g, '<li>$1</li>');
    if (bulletFormatted.includes('<li>') && !bulletFormatted.includes('<ol>')) {
      bulletFormatted = bulletFormatted.replace(/((?:<li>.*?<\/li>\n?)+)/g, '<ul>$1</ul>');
    }
    
    // Paragrafları <p> tagları ile sarma
    const paragraphs = bulletFormatted.split('\n\n');
    const formattedParagraphs = paragraphs.map(p => {
      if (!p.trim()) return '';
      if (p.includes('<ol>') || p.includes('<ul>')) return p;
      return `<p>${p}</p>`;
    });
    
    return formattedParagraphs.join('');
  };

  return (
    <div className="tire-expert-chat">
      <div className="fixed bottom-6 right-6 z-50 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-red-600 hover:scale-110 hover:shadow-2xl"
        onClick={toggleChat}>
        <div className="relative">
          {/* Pulsing circle around icon */}
          <motion.div 
            className="absolute inset-0 rounded-full bg-primary opacity-75"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.2, 0.4]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />

          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.9, 1, 0.9]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              repeatDelay: 1
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="22" y1="12" x2="20" y2="12" />
              <line x1="4" y1="12" x2="2" y2="12" />
              <line x1="19.07" y1="4.93" x2="17.66" y2="6.34" />
              <line x1="6.34" y1="17.66" x2="4.93" y2="19.07" />
              <line x1="19.07" y1="19.07" x2="17.66" y2="17.66" />
              <line x1="6.34" y1="6.34" x2="4.93" y2="4.93" />
            </svg>
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-40 flex h-[500px] w-[350px] flex-col rounded-lg bg-dark-200 shadow-xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex h-14 items-center justify-between rounded-t-lg bg-primary px-4 text-white">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md rotate-12">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <line x1="12" y1="2" x2="12" y2="4" />
                  <line x1="12" y1="20" x2="12" y2="22" />
                  <line x1="22" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="12" x2="2" y2="12" />
                </svg>
                <span className="text-lg font-semibold">Lastik Uzmanı</span>
              </div>
              <button
                onClick={toggleChat}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-600"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isUser = message.role === 'user';
                  // Yazma animasyonu için mesaj içeriğini belirleme
                  let displayContent = message.content;
                  if (message.isTyping && typingMessage !== null) {
                    displayContent = typingMessage.substring(0, typingIndex);
                  }
                  
                  return (
                    <motion.div
                      key={index}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          isUser
                            ? 'bg-primary text-white'
                            : 'bg-dark-300 text-gray-100'
                        }`}
                      >
                        {isUser ? (
                          <div className="break-words text-sm">{displayContent}</div>
                        ) : (
                          <div 
                            className="break-words text-sm message-content" 
                            dangerouslySetInnerHTML={{ __html: formatMessage(displayContent) }}
                          />
                        )}
                        <div
                          className={`mt-1 text-right text-xs ${
                            isUser ? 'text-gray-200' : 'text-gray-400'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {message.isTyping && (
                            <span className="typing-indicator ml-2">
                              <span className="dot"></span>
                              <span className="dot"></span>
                              <span className="dot"></span>
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Analysis Share Button */}
            {!!analysisResults && (
              <div className="mx-4 mb-2">
                <motion.button
                  onClick={handleShareAnalysis}
                  disabled={isLoading || typingMessage !== null}
                  className="flex w-full items-center justify-center space-x-2 rounded bg-primary px-4 py-2 text-white transition-colors hover:bg-red-600 disabled:bg-red-400"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 15, 0, -15, 0] }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity,
                      repeatDelay: 3 
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                      <path d="M7 12h10" />
                      <path d="M12 7v10" />
                    </svg>
                  </motion.div>
                  <span className="font-medium">Analiz Raporunu Paylaş</span>
                </motion.button>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-dark-100 p-4">
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (inputMessage.trim() !== '' && !isLoading && typingMessage === null) {
                        handleSendMessage();
                      }
                    }
                  }}
                  disabled={isLoading || typingMessage !== null}
                  placeholder="Lastik uzmanına bir soru sorun..."
                  className="flex-1 rounded-full border border-dark-100 bg-dark-300 py-2 px-4 text-gray-100 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-red-300 disabled:bg-dark-400"
                />
                <button
                  onClick={() => {
                    if (inputMessage.trim() !== '' && !isLoading && typingMessage === null) {
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading || inputMessage.trim() === '' || typingMessage !== null}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-red-600 disabled:bg-red-400"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TireExpertChat; 