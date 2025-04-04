import { motion } from 'framer-motion';
import { AnalysisResult } from '../types';

interface TahminiOmurSectionProps {
  estimatedLifespan: AnalysisResult['estimatedLifespan'];
  t?: any;
}

const TahminiOmurSection: React.FC<TahminiOmurSectionProps> = ({
  estimatedLifespan,
  t
}) => {
  return (
    <div className="bg-dark-200 p-8 rounded-xl border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-medium text-white">{t?.results?.lifespan || 'Tahmini Ömür'}</h3>
        
        <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
          estimatedLifespan?.months > 24 ? 'bg-green-500/20 text-green-500' : 
          estimatedLifespan?.months > 12 ? 'bg-yellow-500/20 text-yellow-500' : 
          'bg-red-500/20 text-red-500'
        }`}>
          {estimatedLifespan?.months > 24 ? 'İyi Durum' : 
           estimatedLifespan?.months > 12 ? 'Dikkat Edilmeli' : 
           'Kritik'}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-dark-300 p-4 rounded-lg border border-gray-600">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p className="text-gray-300 mb-1">Tahmini Kalan Süre:</p>
              <div className="flex items-baseline">
                <p className={`text-2xl font-bold ${
                  estimatedLifespan?.months > 24 ? 'text-green-500' : 
                  estimatedLifespan?.months > 12 ? 'text-yellow-500' : 
            'text-red-500'
          }`}>
                  {estimatedLifespan?.months && Math.floor(estimatedLifespan.months / 12) > 0 ? 
                    `${Math.floor(estimatedLifespan.months / 12)} yıl ` : ''}
                  {estimatedLifespan?.months && estimatedLifespan.months % 12} ay
          </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full bg-dark-300 rounded-full h-3 mt-4">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              estimatedLifespan?.months > 24 ? 'bg-green-500' : 
              estimatedLifespan?.months > 12 ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}
            style={{ width: `${estimatedLifespan?.months ? Math.min(100, (estimatedLifespan.months/36)*100) : 0}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-sm mt-2">
          <p className="text-gray-400">Tahmin Güvenilirliği</p>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-1.5 ${
              estimatedLifespan?.confidence > 0.8 ? 'bg-green-500' :
              estimatedLifespan?.confidence > 0.6 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}></div>
          <p className="text-gray-400">
              {estimatedLifespan?.confidence && Math.round(estimatedLifespan.confidence * 100)}%
          </p>
        </div>
        </div>
        
        <div className="mt-4 bg-dark-400/30 p-4 rounded-lg">
          <h4 className="text-white text-base mb-2 font-medium flex items-center">
            <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Değerlendirme
          </h4>
          <p className={`text-sm ${
            estimatedLifespan?.months > 24 ? 'text-green-500' : 
            estimatedLifespan?.months > 12 ? 'text-yellow-500' : 
            'text-red-500'
          }`}>
            {estimatedLifespan?.months > 24 ? 
              'Lastiğiniz iyi durumda ve uzun süre kullanılabilir. Düzenli kontroller ile ömrünü uzatabilirsiniz.' : 
             estimatedLifespan?.months > 12 ? 
              'Lastiğinizin ömrü orta seviyede, bir süre daha kullanabilirsiniz. Yakın zamanda değişim planlamanız önerilir.' : 
              'Lastiğinizin ömrü kritik seviyede. En kısa sürede değiştirmeniz güvenliğiniz için önemlidir.'}
          </p>
        </div>
        
        <div className="mt-2 bg-primary/10 p-4 rounded-lg border border-primary/30">
          <h4 className="text-white text-base mb-2 font-medium flex items-center">
            <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Önerilen Aksiyon
          </h4>
          <p className="text-sm text-gray-300">
            {estimatedLifespan?.months > 24 ? 
              'Her 6 ayda bir diş derinliği ve basınç kontrolü yaparak lastiğinizin ömrünü uzatabilirsiniz.' : 
             estimatedLifespan?.months > 12 ? 
              'Önümüzdeki 3-6 ay içinde lastik değişimi için bütçe planlaması yapmanız ve lastik seçeneklerini araştırmanız önerilir.' : 
              'En kısa sürede bir lastik bayisine giderek değişim seçeneklerini değerlendirmeniz önemlidir. Mevcut lastikle yolculuk yapmak risk oluşturabilir.'}
          </p>
      </div>
        
        <div className="flex items-center justify-between text-sm mt-2 text-gray-400 text-xs">
          <span>Tahmini hesaplama, lastik yaşı, kullanım, görsel durum, koşullar ve ortalama lastik ömrü verilerine dayanmaktadır.</span>
        </div>
      </div>
    </div>
  );
};

export default TahminiOmurSection; 