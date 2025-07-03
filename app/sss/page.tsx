'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Search } from 'lucide-react';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: 'Ürün Bilgisi',
    question: 'Hangi araçlar için hangi lastikler uygundur?',
    answer: 'Aracınızın marka, model ve yıl bilgilerine göre uygun lastik seçeneklerini sitemizde bulabilirsiniz. Ayrıca lastik ölçülerinizi kontrol ederek de uyumlu lastikleri listeleyebilirsiniz.'
  },
  {
    id: '2',
    category: 'Sipariş Süreci',
    question: 'Siparişimi nasıl verebilirim?',
    answer: 'Sitemizde beğendiğiniz lastiği sepete ekleyip, ödeme adımlarını takip ederek siparişinizi tamamlayabilirsiniz. Sipariş sürecinde size yardımcı olmak için her adımda açıklamalar bulunmaktadır.'
  },
  {
    id: '3',
    category: 'Ödeme ve Fatura',
    question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
    answer: 'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerimiz mevcuttur. Tüm ödemeleriniz güvenli ödeme altyapımız ile korunmaktadır.'
  },
  {
    id: '4',
    category: 'Kargo ve Teslimat',
    question: 'Kargom kaç günde gelir? Kargo ücreti nedir?',
    answer: 'Siparişleriniz genellikle 1-3 iş günü içerisinde kargoya verilmektedir. Kargo ücreti, seçtiğiniz lastik adedi ve bölgenize göre değişiklik göstermektedir. 1000 TL üzeri siparişlerde kargo ücretsizdir.'
  },
  {
    id: '5',
    category: 'İade ve Değişim',
    question: 'Lastiği iade edebilir miyim? Şartları nedir?',
    answer: 'Satın aldığınız lastikleri, kullanılmamış ve orijinal ambalajında olması şartıyla 14 gün içerisinde iade edebilirsiniz. İade sürecinde ürünün kullanılmamış olması önemlidir.'
  },
  {
    id: '6',
    category: 'Garanti ve Servis',
    question: 'Lastikleriniz garanti kapsamında mı?',
    answer: 'Tüm lastiklerimiz üretici garantisi kapsamındadır. Garanti süresi lastik markasına göre değişiklik göstermektedir. Detaylı bilgi için ürün sayfasındaki garanti bilgilerini inceleyebilirsiniz.'
  }
];

const categories = Array.from(new Set(faqData.map(item => item.category)));

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, boolean>>({});

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFeedback = (id: string, isHelpful: boolean) => {
    setFeedback(prev => ({ ...prev, [id]: isHelpful }));
    // Burada geri bildirimi API'ye gönderebilirsiniz
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <main className="min-h-screen bg-dark-400">
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">Sıkça Sorulan Sorular</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">Lastik Bende hakkında merak ettiğiniz tüm sorular ve cevapları</p>
        </div>
        
        {/* Arama ve Filtreleme */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto relative mb-8">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Sorunuzu arayın..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-3 w-full rounded-xl bg-zinc-900 border-zinc-800 text-white placeholder-gray-400 shadow-sm focus:border-red-600 focus:ring-2 focus:ring-red-900/50 transition-all duration-200"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-6 py-2 transition-all duration-200 ${
                selectedCategory === null 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'border-red-600 text-gray-300 hover:bg-red-600/10'
              }`}
            >
              Tümü
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-6 py-2 transition-all duration-200 ${
                  selectedCategory === category 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'border-red-600 text-gray-300 hover:bg-red-600/10'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* SSS Listesi */}
        <div className="max-w-5xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFAQs.map((item) => (
              <AccordionItem 
                key={item.id} 
                value={item.id}
                className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <AccordionTrigger 
                  className="px-8 py-6 text-left hover:bg-zinc-800 transition-all duration-200 [&[data-state=open]>div>div>h3]:text-red-500 no-underline hover:no-underline"
                >
                  <div>
                    <span className="text-sm text-red-500 font-medium mb-2 block">{item.category}</span>
                    <h3 className="text-white font-medium text-lg transition-colors duration-200">{item.question}</h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-6">
                  <div className="space-y-4">
                    <p className="text-gray-300 text-base leading-relaxed">{item.answer}</p>
                    
                    {/* Geri Bildirim */}
                    {!feedback[item.id] && (
                      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-zinc-800">
                        <span className="text-sm text-gray-400">Bu cevap faydalı oldu mu?</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(item.id, true)}
                          className="text-gray-300 hover:bg-zinc-800 hover:text-white"
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Evet
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(item.id, false)}
                          className="text-gray-300 hover:bg-zinc-800 hover:text-white"
                        >
                          <ThumbsDown className="w-4 h-4 mr-2" />
                          Hayır
                        </Button>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </main>
  );
} 