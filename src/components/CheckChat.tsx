import {
  getChatMessages,
  getChatorCreateChat,
  markAsRead,
  saveAudio,
  saveCall,
  saveImage,
  saveMessage,
  uploadAudio,
  uploadImage,
} from "@/services/chatApi";
import { CheckChatProps, Message } from "@/Types/chat";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Picker, { EmojiClickData } from "emoji-picker-react";
import { useSocketStore } from "@/store/socketStore";
import { FaVideo } from "react-icons/fa";

const CheckChat: React.FC<CheckChatProps> = ({
  currentUserId,
  otherUserId,
  otherUserDetails,
  onNewMessage,
  onMessagesRead,
}) => {
  const { socket, initializeSocket, handleCall, emitChatMessage, ongoingCall } =
    useSocketStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [call, setCall] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) {
      console.log("initializing in component");
      initializeSocket();
    }
    if (socket) {
      console.log("socket is presnet", socket);
    }
  }, [initializeSocket, socket]);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      const height = chatContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      chatContainerRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, []);

  useEffect(() => {
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
            onMessagesRead(otherUserId);
            setTimeout(scrollToBottom, 0);
          } else {
            setMessages([]);
          }
        } else {
          console.error("Chat Id not found");
        }
      } catch (error) {
        console.error("Error fetching chat or messages:", error);
        setMessages([]);
      }
    };

    fetchChat();
  }, [currentUserId, otherUserId, onMessagesRead, scrollToBottom]);

  useEffect(() => {
    if (!socket) {
      initializeSocket();
    }
  }, [initializeSocket, socket]);

  useEffect(() => {
    if (socket) {
      const handleChatMessage = (message: Message) => {
        if (message.senderId === otherUserId) {
          setMessages((prevMessages) => [...prevMessages, message]);

          onNewMessage(message.senderId, {
            _id: message._id,
            messageText: message.messageText,
            image: message.image as string,
            audio: message.audio as string,
            call: message.call as boolean,
            createdAt: message.createdAt,
            senderId: message.senderId,
            senderName: otherUserDetails?.username,
          });
        }
      };

      socket.on("chat message", handleChatMessage);

      return () => {
        socket.off("chat message", handleChatMessage);
      };
    }
  }, [socket, onNewMessage, otherUserDetails?.username, otherUserId]);

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
          const imageMessageData = {
            chatId,
            senderId: currentUserId,
            receiverId: otherUserId,
            image: imageUrl,
            messageText: "",
            audio: "",
            call: false,
            createdAt: Date.now(),
          };
          console.log(imageMessageData, "dsdjs");
          emitChatMessage(imageMessageData);
          setSelectedImage(null);
          setImagePreview(null);
        } else if (audioBlob) {
          const formData = new FormData();
          formData.append("file", audioBlob, "voice-message.webm");
          const audioUrl = await uploadAudio(chatId, currentUserId, formData);
          savedMessage = await saveAudio(chatId, currentUserId, audioUrl);

          const audioMessageData = {
            chatId,
            senderId: currentUserId,
            receiverId: otherUserId,
            image: "",
            messageText: "",
            audio: audioUrl,
            call: false,
            createdAt: Date.now(),
          };

          emitChatMessage(audioMessageData);
          setAudioBlob(null);
        } else if (inputMessage.trim()) {
          const messageData = {
            chatId,
            senderId: currentUserId,
            receiverId: otherUserId,
            image: "",
            messageText: inputMessage.trim(),
            audio: "",
            createdAt: Date.now(),
          };
          savedMessage = await saveMessage(
            chatId,
            currentUserId,
            inputMessage.trim()
          );
          emitChatMessage(messageData);
        } else {
          return;
        }

        setMessages((prevMessages) =>
          prevMessages.some((msg) => msg._id === savedMessage?._id)
            ? prevMessages
            : [...prevMessages, savedMessage]
        );

        onNewMessage(otherUserId, {
          _id: savedMessage._id,
          messageText: savedMessage.messageText,
          image: savedMessage.image as string,
          audio: savedMessage.audio as string,
          call: savedMessage.call,
          createdAt: savedMessage.createdAt,
          senderId: savedMessage.senderId,
          senderName: "Me",
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

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const initiateVideoCall = async () => {
    if (socket && chatId) {
      const savedMessage = await saveCall(chatId, currentUserId, true);
      console.log(savedMessage, 'savedMessage')
      const callMessageData = {
        chatId,
        senderId: currentUserId,
        receiverId: otherUserId,
        image: "",
        messageText: "",
        audio: "",
        call: true,
        createdAt: Date.now(),
      };

      emitChatMessage(callMessageData);

      setMessages((prevMessages) =>
        prevMessages.some((msg) => msg._id === savedMessage?._id)
          ? prevMessages
          : [...prevMessages, savedMessage]
      );

      onNewMessage(otherUserId, {
        _id: savedMessage._id,
        messageText: savedMessage.messageText,
        image: savedMessage.image as string,
        audio: savedMessage.audio as string,
        call: savedMessage.call,
        createdAt: savedMessage.createdAt,
        senderId: savedMessage.senderId,
        senderName: "Me",
      });

      handleCall(otherUserDetails);
    }
  };

  return (
    <div className="flex flex-col h-full relativ">
      <div className="bg-gray-900 flex justify-between text-white border-transparent rounded-2xl px-2">
        <div className="flex">
          <Image
            className="w-10 h-10 rounded-full mr-3"
            src={otherUserDetails?.profilePhoto || "/default-profile.jpg"}
            alt={otherUserDetails?.username}
            width={40}
            height={40}
            priority={true}
          />

          <p>{otherUserDetails?.username}</p>
        </div>
        <div className="items-center py-2">
          <Image
            src="/asset/videocall.png"
            alt="/default-profile.jpg"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={initiateVideoCall}
          />
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-grow overflow-auto mb-4 overflow-y-scroll no-scrollbar"
      >
        {messages.length ? (
          messages.map((message: Message, index) => (
            <div
              key={message._id || index}
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
                  <Image
                  src={message.image}
                  alt="Message"
                  className="mt-2 max-w-xs h-20 w-auto cursor-pointer"
                  width={80} 
                  height={80}
                  onClick={() => handleShowFullScreen(message.image as string)}
                  style={{ objectFit: 'fill' }} 
                />
                )}

                {message.call && (
                  <div
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      message.senderId === currentUserId
                        ? "bg-yellow-400 text-black"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    <FaVideo />
                    <span>
                      {message.senderId === currentUserId
                        ? "Outgoing"
                        : "Incoming"}{" "}
                      Video Call
                    </span>
                  </div>
                )}

                {message.audio && (
                  <audio controls className="mt-2">
                    <source src={message.audio} type="audio/webm" />
                    Your browser does not support the audio element.
                  </audio>
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

          <button
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
              isRecording ? "bg-red-500 text-white" : "bg-gray-500 text-white"
            }`}
          >
            🎤
          </button>

          {imagePreview && (
            <div className="relative">
              <Image
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

          {audioBlob && (
            <div className="relative">
              <audio controls>
                <source
                  src={URL.createObjectURL(audioBlob)}
                  type="audio/webm"
                />
                Your browser does not support the audio element.
              </audio>
              <button
                type="button"
                className="absolute top-0 right-0 text-red-500"
                onClick={() => setAudioBlob(null)}
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
            <Image
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
    </div>
  );
};

export default CheckChat;
