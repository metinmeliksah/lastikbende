import React from 'react';
import { motion } from 'framer-motion';
import { FaCommentAlt, FaCarSide } from 'react-icons/fa';

interface ChatIconProps {
  onClick: () => void;
}

const ChatIcon: React.FC<ChatIconProps> = ({ onClick }) => {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700"
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <FaCarSide className="absolute -left-3 -top-1 text-2xl" />
        <FaCommentAlt className="text-2xl" />
      </div>
    </motion.div>
  );
};

export default ChatIcon; 