import React from 'react';

const ChatList = ({ onSelectUser }) => {
  // This is a mock-up. You'll need to fetch actual chat data
  const chats = [
    { id: '1', name: 'John Doe', lastMessage: 'Hello there!' },
    { id: '2', name: 'Jane Smith', lastMessage: 'How are you?' },
    // ... more chats
  ];

  return (
    <div className="h-full overflow-y-auto">
      <h2 className="text-xl font-bold p-4 border-b">Chats</h2>
      {chats.map(chat => (
        <div 
          key={chat.id} 
          className="p-4 border-b hover:bg-gray-100 cursor-pointer"
          onClick={() => onSelectUser(chat)}
        >
          <h3 className="font-semibold">{chat.name}</h3>
          <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
        </div>
      ))}
    </div>
  );
};

export default ChatList;