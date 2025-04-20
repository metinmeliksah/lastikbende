import React, { Dispatch, SetStateAction, RefObject } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaPaperPlane, FaFileAlt } from 'react-icons/fa';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  messages: Message[];
  inputMessage: string;
  setInputMessage: Dispatch<SetStateAction<string>>;
  handleSendMessage: () => Promise<void>;
  handleShareAnalysis: () => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
  messagesEndRef: RefObject<HTMLDivElement>;
  hasAnalysisResults: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleShareAnalysis,
  isLoading,
  onClose,
  messagesEndRef,
  hasAnalysisResults,
}) => {
  return (
    <motion.div
      className="fixed bottom-24 right-6 z-40 flex h-[500px] w-[350px] flex-col rounded-lg bg-white shadow-xl"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between rounded-t-lg bg-blue-600 px-4 text-white">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold">Lastik Uzmanı</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-blue-700"
        >
          <FaTimes />
        </button>
      </div>

      {/* Messages */}
      <MessageList messages={messages} messagesEndRef={messagesEndRef} />

      {/* Analysis Share Button */}
      {hasAnalysisResults && (
        <div className="mx-4 mb-2">
          <button
            onClick={handleShareAnalysis}
            disabled={isLoading}
            className="flex w-full items-center justify-center space-x-2 rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:bg-green-300"
          >
            <FaFileAlt />
            <span>Analiz Raporunu Paylaş</span>
          </button>
        </div>
      )}

      {/* Input */}
      <MessageInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </motion.div>
  );
};

export default ChatWindow; 