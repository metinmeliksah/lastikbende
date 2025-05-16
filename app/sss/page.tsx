'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sıkça Sorulan Sorular</h1>
      
      {/* Arama ve Filtreleme */}
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Sorunuzu arayın..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="mb-4"
        />
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            Tümü
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* SSS Listesi */}
      <Accordion type="single" collapsible className="w-full">
        {filteredFAQs.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-left">
              <div>
                <span className="text-sm text-gray-500">{item.category}</span>
                <h3 className="font-medium">{item.question}</h3>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>{item.answer}</p>
                
                {/* Geri Bildirim */}
                {!feedback[item.id] && (
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-sm text-gray-500">Bu cevap faydalı oldu mu?</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(item.id, true)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Evet
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(item.id, false)}
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
  );
} 