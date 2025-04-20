import React, { Dispatch, SetStateAction } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

interface MessageInputProps {
  inputMessage: string;
  setInputMessage: Dispatch<SetStateAction<string>>;
  handleSendMessage: () => Promise<void>;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isLoading,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim() !== '') {
        handleSendMessage();
      }
    }
  };

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Lastik uzmanına bir soru sorun..."
          className="flex-1 rounded-full border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
        />
        <button
          onClick={() => {
            if (inputMessage.trim() !== '') {
              handleSendMessage();
            }
          }}
          disabled={isLoading || inputMessage.trim() === ''}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <FaPaperPlane />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput; 