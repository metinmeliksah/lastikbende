import { motion } from 'framer-motion';
import { AnalysisResult } from '../types';

interface BakimIhtiyaclariSectionProps {
  maintenanceNeeds: AnalysisResult['maintenanceNeeds'];
  t?: any;
}

const BakimIhtiyaclariSection: React.FC<BakimIhtiyaclariSectionProps> = ({
  maintenanceNeeds,
  t
}) => {
  return (
    <div className="bg-dark-200 p-4 sm:p-6 md:p-8 rounded-xl border border-gray-700 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-medium text-white mb-3 sm:mb-0">{t?.maintenance?.title || 'Bakım İhtiyaçları'}</h3>
        
        {/* Bakım ihtiyaçları sayaçları */}
        <div className="flex flex-wrap items-center gap-2 sm:space-x-3">
          {maintenanceNeeds?.immediate && maintenanceNeeds.immediate.length > 0 && (
            <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500/10 rounded-lg border border-red-500/30">
              <span className="text-red-500 font-medium">{maintenanceNeeds.immediate.length}</span>
              <span className="text-gray-300 ml-1 sm:ml-1.5 text-sm sm:text-base">Acil</span>
            </div>
          )}
          
          {maintenanceNeeds?.soon && maintenanceNeeds.soon.length > 0 && (
            <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <span className="text-yellow-500 font-medium">{maintenanceNeeds.soon.length}</span>
              <span className="text-gray-300 ml-1 sm:ml-1.5 text-sm sm:text-base">Yakında</span>
            </div>
          )}
          
          {maintenanceNeeds?.future && maintenanceNeeds.future.length > 0 && (
            <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500/10 rounded-lg border border-green-500/30">
              <span className="text-green-500 font-medium">{maintenanceNeeds.future.length}</span>
              <span className="text-gray-300 ml-1 sm:ml-1.5 text-sm sm:text-base">İleride</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {maintenanceNeeds?.immediate && maintenanceNeeds.immediate.length > 0 && (
          <div className="bg-red-500/10 p-3 sm:p-4 rounded-lg border border-red-500/30">
            <h4 className="text-red-500 font-medium mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              Acil Bakım Gerektiren
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {maintenanceNeeds.immediate.map((need, index) => (
                <li key={index} className="bg-dark-400/40 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2 mt-1">•</span>
                    <span className="text-gray-300 text-sm sm:text-base">{need}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {maintenanceNeeds?.soon && maintenanceNeeds.soon.length > 0 && (
          <div className="bg-yellow-500/10 p-3 sm:p-4 rounded-lg border border-yellow-500/30">
            <h4 className="text-yellow-500 font-medium mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Yakın Zamanda Bakım Gerektiren
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {maintenanceNeeds.soon.map((need, index) => (
                <li key={index} className="bg-dark-400/40 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-1">•</span>
                    <span className="text-gray-300 text-sm sm:text-base">{need}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {maintenanceNeeds?.future && maintenanceNeeds.future.length > 0 && (
          <div className="bg-green-500/10 p-3 sm:p-4 rounded-lg border border-green-500/30">
            <h4 className="text-green-500 font-medium mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              İleriye Dönük Bakım
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {maintenanceNeeds.future.map((need, index) => (
                <li key={index} className="bg-dark-400/40 p-2 sm:p-3 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    <span className="text-gray-300 text-sm sm:text-base">{need}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {(!maintenanceNeeds?.immediate || maintenanceNeeds.immediate.length === 0) && 
         (!maintenanceNeeds?.soon || maintenanceNeeds.soon.length === 0) && 
         (!maintenanceNeeds?.future || maintenanceNeeds.future.length === 0) && (
          <p className="text-green-500 text-center bg-green-500/10 p-3 sm:p-4 rounded-lg border border-green-500/30">
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-sm sm:text-base">Acil bakım gerektiren bir durum bulunmamaktadır.</span>
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default BakimIhtiyaclariSection; 