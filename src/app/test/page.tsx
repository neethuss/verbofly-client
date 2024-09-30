// src/pages/chat.tsx
import React from 'react';

const ChatPage: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-[#4a154b] text-white p-4">
        <div className="text-2xl font-bold mb-4">Skype</div>
        <ul>
          <li className="flex items-center mb-4 p-2 rounded-md bg-[#e03a3c]">
            <img
              className="w-10 h-10 rounded-full mr-3"
              src="/profile1.jpg"
              alt="Profile"
            />
            <div>
              <div className="font-semibold">Scale Gong</div>
              <div className="text-sm text-gray-300">Lorem Ipsum</div>
            </div>
          </li>
          {/* Additional users go here */}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="w-3/4 bg-[#f7f7f8] p-6 flex flex-col">
        <div className="flex-grow overflow-auto">
          <div className="flex mb-4">
            <img
              className="w-10 h-10 rounded-full mr-3"
              src="/profile2.jpg"
              alt="Profile"
            />
            <div className="bg-[#dedee0] text-black p-3 rounded-lg max-w-xs">
              To take a trivial example
            </div>
          </div>
          <div className="flex mb-4 justify-end">
            <div className="bg-[#7e57c2] text-white p-3 rounded-lg max-w-xs">
              But I must explain to you how all this mistaken idea
            </div>
          </div>
          {/* Additional messages go here */}
        </div>
        <div className="mt-4">
          <input
            className="w-full p-3 rounded-full border border-gray-300 focus:outline-none"
            type="text"
            placeholder="Type something..."
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
