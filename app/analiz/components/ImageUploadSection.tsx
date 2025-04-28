import { useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaTachometerAlt, FaTimesCircle, FaInfoCircle, FaCamera, FaLightbulb, FaExclamationTriangle } from 'react-icons/fa';

interface ImageUploadSectionProps {
  preview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
  t: any;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  preview,
  fileInputRef,
  handleImageUpload,
  handleRemoveImage,
  t
}) => {
  const [showGuidelines, setShowGuidelines] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-dark-200 p-4 sm:p-8 rounded-xl border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
      role="region"
      aria-label={t?.form?.uploadButton || 'Fotoğraf Yükleme Bölümü'}
    >
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <label className="block text-lg sm:text-xl font-medium text-white flex items-center">
          <FaTachometerAlt className="text-primary mr-2" aria-hidden="true" />
          {t?.form?.uploadButton || 'Fotoğraf Yükleme'}
        </label>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowGuidelines(!showGuidelines);
          }}
          className="flex items-center text-primary hover:text-primary/80 transition-colors"
          aria-label="Fotoğraf çekme kılavuzu"
        >
          <FaInfoCircle className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Kılavuz</span>
        </button>
      </div>
      
      {showGuidelines && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 bg-dark-300 rounded-lg p-4 border border-primary/20"
        >
          <h3 className="text-white font-medium mb-3 flex items-center">
            <FaLightbulb className="text-primary mr-2" />
            Lastik Fotoğrafı Çekme Kılavuzu
          </h3>
          
          <div className="space-y-3 text-gray-300 text-sm">
            <div className="flex items-start">
              <FaCamera className="text-primary mt-1 mr-2 flex-shrink-0" />
              <p>Lastiği düz bir zeminde, iyi aydınlatılmış ortamda çekin.</p>
            </div>
            
            <div className="flex items-start">
              <FaCamera className="text-primary mt-1 mr-2 flex-shrink-0" />
              <p>Lastiğin tamamını gösteren, yandan çekilmiş bir fotoğraf yükleyin.</p>
            </div>
            
            <div className="flex items-start">
              <FaCamera className="text-primary mt-1 mr-2 flex-shrink-0" />
              <p>Lastik yanak kısmını (üzerinde ebat, marka ve model bilgilerinin olduğu kısım) net gösterin.</p>
            </div>
            
            <div className="flex items-start">
              <FaExclamationTriangle className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
              <p>Karanlık, bulanık veya kısmi görüntüler analiz sonuçlarını olumsuz etkileyebilir.</p>
            </div>
            
            <div className="flex items-start">
              <FaExclamationTriangle className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
              <p>Maksimum dosya boyutu: 5MB. Desteklenen formatlar: PNG, JPG, GIF</p>
            </div>
          </div>
        </motion.div>
      )}
      
      {!preview ? (
        <div className="space-y-3 text-center">
          <div className="flex flex-col items-center">
            <motion.svg 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mx-auto h-12 sm:h-14 w-12 sm:w-14 text-gray-400 group-hover:text-primary transition-colors duration-200" 
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
            <motion.label 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-3 cursor-pointer bg-dark-300 rounded-lg font-medium text-primary hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary transition-all duration-200"
            >
              <span className="text-lg sm:text-xl">{t?.form?.uploadButton || 'Fotoğraf yükle'}</span>
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleImageUpload}
                aria-label={t?.form?.uploadButton || 'Fotoğraf yükle'}
              />
            </motion.label>
          </div>
          <p className="text-sm sm:text-base text-gray-400">
            {t?.form?.uploadInfo || 'PNG, JPG, GIF max 5MB'}
          </p>
        </div>
      ) : (
        <div className="mt-4 sm:mt-6">
          {/* Remove Button for Extra Small Devices */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRemoveImage}
            className="w-full mb-3 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 rounded-lg py-2 px-4 hover:bg-red-500/20 transition-all duration-200 sm:hidden"
            aria-label={t?.form?.removePhoto || 'Fotoğrafı kaldır'}
          >
            <FaTimesCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{t?.form?.removePhoto || 'Fotoğrafı kaldır'}</span>
          </motion.button>

          {/* Image Preview Container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            {/* Remove Button for Larger Devices */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRemoveImage}
              className="hidden sm:flex absolute -top-3 -right-3 z-10 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-200 shadow-lg"
              aria-label={t?.form?.removePhoto || 'Fotoğrafı kaldır'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Image Preview with Overlay for Extra Small Devices */}
            <div className="relative w-full max-w-[280px] xs:max-w-[300px] mx-auto group">
              <Image
                src={preview}
                alt={t?.form?.title || 'Lastik önizleme'}
                width={300}
                height={300}
                className="w-full h-auto rounded-xl shadow-lg border border-gray-700 hover:border-primary transition-all duration-200"
                priority
              />
              
              {/* Touch-friendly overlay for extra small devices */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl sm:hidden">
                <button
                  onClick={handleRemoveImage}
                  className="absolute inset-0 w-full h-full flex items-center justify-center text-white"
                  aria-label={t?.form?.removePhoto || 'Fotoğrafı kaldır'}
                >
                  <FaTimesCircle className="w-8 h-8 opacity-75" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ImageUploadSection; 