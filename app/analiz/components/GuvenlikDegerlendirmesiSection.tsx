import { motion } from 'framer-motion';
import { AnalysisResult } from '../types';

interface GuvenlikDegerlendirmesiSectionProps {
  safetyScore: number;
  t?: any;
}

const GuvenlikDegerlendirmesiSection: React.FC<GuvenlikDegerlendirmesiSectionProps> = ({
  safetyScore,
  t
}) => {
  return (
    <div className="bg-dark-200 p-4 sm:p-8 rounded-xl border border-gray-700 shadow-lg">
      <h3 className="text-xl sm:text-2xl font-medium text-white mb-3 sm:mb-4">{t?.results?.safety || 'Güvenlik Değerlendirmesi'}</h3>
      
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between mb-2 items-center">
          <p className="text-base sm:text-xl text-gray-300">Genel Güvenlik Puanı</p>
          <div className="flex items-center">
            <span className={`text-lg sm:text-xl font-bold ${
              safetyScore >= 80 ? 'text-green-500' : 
              safetyScore >= 60 ? 'text-yellow-500' : 
              'text-red-500'
            }`}>
              {safetyScore}%
            </span>
          </div>
        </div>
        
        <div className="w-full bg-dark-300 rounded-full h-3 sm:h-4 mb-1">
          <div 
            className={`h-3 sm:h-4 rounded-full transition-all duration-500 ${
              safetyScore >= 80 ? 'bg-green-500' : 
              safetyScore >= 60 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
            style={{ width: `${safetyScore}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 px-1">
          <span>0</span>
          <span>20</span>
          <span>40</span>
          <span>60</span>
          <span>80</span>
          <span>100</span>
        </div>
      </div>
      
      <div>
        <p className="text-sm sm:text-base text-gray-200 mb-2 sm:mb-3">
          Güvenlik puanı, tüm lastik faktörlerinin (yaş, kullanım, görsel durum, marka ve mevsimsel uygunluk) ağırlıklı bir değerlendirmesidir.
        </p>
        <div className="bg-dark-300 p-3 sm:p-4 rounded-lg border border-gray-600">
          <p className={`text-base sm:text-lg font-medium mb-1 sm:mb-2 ${
            safetyScore >= 80 ? 'text-green-500' : 
            safetyScore >= 60 ? 'text-yellow-500' : 
              'text-red-500'
            }`}>
            {safetyScore >= 80 ? 'Güvenli' : 
             safetyScore >= 60 ? 'Dikkat Gerekli' : 
             'Riskli'}
          </p>
          <p className="text-sm sm:text-base text-gray-300">
            {safetyScore >= 80 
              ? 'Lastiğiniz güvenli durumdadır. Standart bakım işlemlerini sürdürmeniz önerilir.'
              : safetyScore >= 60 
              ? 'Lastiğiniz dikkat gerektiriyor. Sorunlar incelenmeli ve yakın zamanda bakım planlanmalıdır.'
              : 'Lastiğiniz güvenlik açısından riskli durumda. En kısa sürede değerlendirilmesi veya değiştirilmesi önerilir.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuvenlikDegerlendirmesiSection; 