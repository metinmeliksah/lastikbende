import React, { RefObject } from 'react';
import { motion } from 'framer-motion';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  messagesEndRef: RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, messagesEndRef }) => {
  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          return (
            <motion.div
              key={index}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="break-words text-sm">{message.content}</div>
                <div
                  className={`mt-1 text-right text-xs ${
                    isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList; 