import React, { useState, useEffect, useRef, useCallback } from "react";
import Picker, { EmojiClickData } from "emoji-picker-react";
import Image from "next/image";
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";
import {
  getChatMessages,
  getChatorCreateChat,
  markAsRead,
  saveImage,
  saveMessage,
  uploadImage,
} from "@/services/chatApi";
import {
  ChatProps,
  Message,
  OngoingCall,
  PeerData,
  User,
  IVideoCall,
  IVideoContainer,
} from "@/Types/chat";
import { cn } from "@/lib/utils";
import { useSocketStore } from "@/store/socketStore";
import useAuthStore from "@/store/authStore";
import { io, Socket } from "socket.io-client";

const Chat: React.FC<ChatProps> = ({
  currentUserId,
  otherUserId,
  otherUserDetails,
  onNewMessage,
  onMessagesRead
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthStore();
  // const { 
  //   socket, 
  //   isSocketConnected, 
  //   initializeSocket, 
  //   ongoingCall,
  //   handleCall 
  // } = useSocketStore();

  useEffect(() => {
    const newSocket = io("http://localhost:3002");
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      const height = chatContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      chatContainerRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit("join chat", { chatId });

      socket.off("chat message").on("chat message", (message: Message) => {
        setMessages((prevMessages) => {
          if (!prevMessages.some((m) => m._id === message._id)) {
            onNewMessage(message.chatId, {
              _id: message._id,
              messageText: message.messageText,
              image: message.image as string,
              createdAt: message.createdAt,
              senderId: message.senderId,
              senderName: "Other User",
            });
            return [...prevMessages, message];
          }
          return prevMessages;
        });
      });

      const fetchChat = async () => {
        try {
          const chat = await getChatorCreateChat(currentUserId, otherUserId);
          if (chat && chat._id) {
            setChatId(chat._id);
            const messageData = await getChatMessages(chat._id);
            if (Array.isArray(messageData)) {
              setMessages(messageData);
              let afterMarkAsRead = await markAsRead(chat._id, otherUserId);
              setMessages(afterMarkAsRead);
              onMessagesRead(chat._id);
              setTimeout(scrollToBottom, 0);
            } else {
              setMessages([]);
            }
          } else {
            console.error("Chat ID not found");
          }
        } catch (error) {
          console.error("Error fetching chat or messages:", error);
          setMessages([]);
        }
      };

      fetchChat();
    }

    return () => {
      socket?.off("chat message");
    };
  }, [socket, currentUserId, otherUserId, onNewMessage, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (socket && chatId) {
      try {
        let savedMessage;
        if (selectedImage) {
          const formData = new FormData();
          formData.append("file", selectedImage);
          const imageUrl = await uploadImage(chatId, currentUserId, formData);
          savedMessage = await saveImage(chatId, currentUserId, imageUrl);
          setSelectedImage(null);
          setImagePreview(null);
        } else if (inputMessage.trim()) {
          const messageData = {
            chatId,
            senderId: currentUserId,
            receiverId: otherUserId,
            messageText: inputMessage.trim(),
          };
          socket.emit("chat message", messageData);
          savedMessage = await saveMessage(
            chatId,
            currentUserId,
            inputMessage.trim()
          );
        } else {
          return;
        }

        setMessages((prevMessages) => [...prevMessages, savedMessage]);

        onNewMessage(chatId, {
          _id: savedMessage._id,
          messageText: savedMessage.messageText || "",
          image: savedMessage.image || "",
          createdAt: savedMessage.createdAt,
          senderId: savedMessage.senderId,
          senderName:
            savedMessage.senderId === currentUserId ? "You" : "Other User",
        });

        setInputMessage("");
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }
  };

  const addEmoji = (emojiData: EmojiClickData) => {
    setInputMessage((prevMessage) => prevMessage + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShowFullScreen = (imageUrl: string) => {
    setFullScreenImage(imageUrl);
  };

  const handleCloseFullScreen = () => {
    setFullScreenImage(null);
  };

  return (
    <div className="flex flex-col h-full">

      <div className="bg-gray-900 flex justify-between text-white border-transparent rounded-2xl px-2">
        <div className="flex">
          <img
            className="w-10 h-10 rounded-full mr-3"
            src={otherUserDetails.profilePhoto || "/default-profile.jpg"}
            alt={otherUserDetails.username}
          />
          <p>{otherUserDetails.username}</p>
        </div>
        <div className="items-center py-2">
          <Image
            src="/asset/videocall.png"
            alt="/default-profile.jpg"
            width={20}
            height={20}
            className="cursor-pointer"
            // onClick={() => handleCall(otherUserDetails)}
          />
        </div>
      </div>

      
      <div ref={chatContainerRef}  className="flex-grow overflow-auto mb-4 overflow-y-scroll no-scrollbar">
        {messages.length ? (
          messages.map((message: Message) => (
            <div
              key={message._id}
              className={`flex mb-4 ${
                message.senderId === currentUserId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div>
                {message.messageText && (
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.senderId === currentUserId
                        ? "bg-yellow-400 text-black"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {message.messageText}
                  </div>
                )}

                {message.image && (
                  <img
                    src={message.image}
                    alt="Message"
                    className="mt-2 max-w-xs h-20 w-auto object-fill cursor-pointer"
                    onClick={() =>
                      handleShowFullScreen(message.image as string)
                    }
                  />
                )}

                <span className="text-xs text-gray-400 block mt-1 text-right">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="flex justify-center text-center text-gray-400">
            Start a conversation.
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      
      <form onSubmit={sendMessage} className="mt-4 relative">
        <div className="flex space-x-2 items-center">
          <button
            type="button"
            className="text-xl"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            😊
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-6 align-middle bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            📷
          </button>

          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-xs max-h-32 object-cover"
              />
              <button
                type="button"
                className="absolute top-0 right-0 text-red-500"
                onClick={() => {
                  setImagePreview(null);
                  setSelectedImage(null);
                }}
              >
                ❌
              </button>
            </div>
          )}

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className={`w-full p-3 rounded-full bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
              imagePreview ? "hidden" : ""
            }`}
            placeholder="Type something..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-yellow-400 text-black rounded-full hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            Send
          </button>
        </div>
      </form>

     
      {showEmojiPicker && (
        <div style={{ position: "absolute", bottom: "100px", zIndex: 1000 }}>
          <Picker onEmojiClick={addEmoji} />
        </div>
      )}

      
      {fullScreenImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50 p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={fullScreenImage}
              alt="Full screen image"
              className="max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] object-contain"
            />
            <button
              onClick={handleCloseFullScreen}
              className="absolute top-2 right-2 text-white text-2xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      
      {/* {ongoingCall?.isRinging && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-black text-white p-4 rounded-lg shadow-lg">
            <img
              src={ongoingCall.participants.caller.profilePhoto}
              alt="no profile image"
              className="max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] object-contain"
            />
            <h2 className="text-lg font-bold mb-2">Incoming Call</h2>
            <p>{ongoingCall.participants.caller.username} is calling you</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => {
                  // Handle call decline
                }}
              >
                Decline
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={() => {
                  // Handle call accept
                }}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Chat;