import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

export type Step = {
  id: string;
  label: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
};

interface StatusTrackerProps {
  steps: Step[];
  className?: string;
}

const StatusTracker: React.FC<StatusTrackerProps> = ({ steps, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col space-y-2">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`flex items-center p-3 rounded-lg border transition-all duration-300 ${
              step.status === 'waiting'
                ? 'bg-dark-300 border-gray-700/50 text-gray-400'
                : step.status === 'processing'
                ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                : step.status === 'completed'
                ? 'bg-green-500/10 border-green-500/40 text-green-400'
                : 'bg-red-500/10 border-red-500/40 text-red-400'
            }`}
          >
            <div className="flex-shrink-0 mr-3">
              {step.status === 'waiting' ? (
                <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
              ) : step.status === 'processing' ? (
                <FaSpinner className="w-5 h-5 animate-spin text-blue-400" />
              ) : step.status === 'completed' ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <FaCheck className="w-3 h-3 text-dark-100" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <FaExclamationTriangle className="w-3 h-3 text-dark-100" />
                </motion.div>
              )}
            </div>
            <div className="flex-grow">
              <p className="text-sm font-medium">{step.label}</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {step.status === 'processing' && (
                <div className="text-xs text-blue-400">İşleniyor...</div>
              )}
              {step.status === 'completed' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-green-400"
                >
                  Tamamlandı
                </motion.div>
              )}
              {step.status === 'error' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-400"
                >
                  Hata
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StatusTracker; 