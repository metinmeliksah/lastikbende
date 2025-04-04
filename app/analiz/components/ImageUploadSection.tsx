import { useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaTachometerAlt } from 'react-icons/fa';

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
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-dark-200 p-8 rounded-xl border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <label className="block text-xl font-medium text-white mb-6 flex items-center">
        <FaTachometerAlt className="text-primary mr-2" />
        {t?.form?.uploadButton || 'Fotoğraf Yükleme'}
      </label>
      <div className="mt-1 flex flex-col items-center justify-center px-6 pt-10 pb-10 border-2 border-gray-600 border-dashed rounded-xl bg-dark-300 hover:border-primary transition-all duration-200 group">
        <div className="space-y-3 text-center">
          <div className="flex flex-col items-center">
            <motion.svg 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mx-auto h-14 w-14 text-gray-400 group-hover:text-primary transition-colors duration-200" 
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 48 48"
            >
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
            <motion.label 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-3 cursor-pointer bg-dark-300 rounded-lg font-medium text-primary hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary transition-all duration-200"
            >
              <span className="text-xl">{t?.form?.uploadButton || 'Fotoğraf yükle'}</span>
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </motion.label>
          </div>
          <p className="text-base text-gray-400">
            {t?.form?.uploadInfo || 'PNG, JPG, GIF max 5MB'}
          </p>
        </div>
      </div>
      {preview && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 relative"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRemoveImage}
            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-200 shadow-lg"
            aria-label={t?.form?.cancel || 'Fotoğrafı kaldır'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
          <Image
            src={preview}
            alt={t?.form?.title || 'Lastik önizleme'}
            width={300}
            height={300}
            className="mx-auto rounded-xl shadow-lg border border-gray-700 hover:border-primary transition-all duration-200"
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default ImageUploadSection; 