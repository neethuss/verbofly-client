"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSocketStore } from "@/store/socketStore";
import { ToastContainer, toast } from "react-toastify";
import UserNav from "@/components/UserNav";
import { FaSearch, FaUsers } from "react-icons/fa";
import { IoIosChatbubbles } from "react-icons/io";
import useAuthStore from "@/store/authStore";
import { getUserChats } from "@/services/chatApi";
import { fetchUserById } from "@/services/userApi";
import axios from "axios";
import CheckChat from "@/components/CheckChat";
import ProtectedRoute from "@/HOC/ProtectedRoute";
import CallNotification from "@/components/CallNofication";
import Videocall from "@/components/VideoCall";

interface LastMessage {
  _id: string;
  messageText: string;
  createdAt: string;
  senderId: string;
  senderName: string | undefined;
  image: string;
  audio:string
}

export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  isBlocked: boolean;
  country: Country;
  nativeLanguage: Language;
  knownLanguages: Language[];
  languagesToLearn: Language[];
  profilePhoto: string;
  bio: string;
  sentRequests: User[];
  receivedRequests: User[];
  connections: User[];
  isSubscribed: boolean;
  expirationDate: Date;
}

export interface Country {
  countryName: string;
  isBlocked: boolean;
}

export interface Language {
  languageName: string;
  countries: Country[];
  isBlocked: boolean;
}

interface Chat {
  _id: string;
  lastMessage: LastMessage;
  otherUser: User;
  unreadMessages: number;
}

const page = () => {
  const { user, logout } = useAuthStore();
  const { userId } = useParams();

  const router = useRouter();
  const currentUserId = user?.user?._id;
  const { socket, initializeSocket, ongoingCall } = useSocketStore();

  const [chatUsers, setChatUsers] = useState<Chat[]>([]);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(
    ""
  );
  const [selectedChatUserDetails, setSelectedChatUserDetails] =
    useState<User>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    console.log(currentUserId, "cuu");

    const fetchUserChats = async () => {
      if (currentUserId) {
        try {
          const chats = await getUserChats(currentUserId);
          console.log(chats, "AllChats");

          const sortedChats = chats.sort(
            (a: Chat, b: Chat) =>
              new Date(b.lastMessage.createdAt).getTime() -
              new Date(a.lastMessage.createdAt).getTime()
          );
          console.log(sortedChats, "sortedChats");

          setChatUsers(sortedChats);

          if (sortedChats.length > 0) {
            const selectedChat = sortedChats.find(
              (chat: Chat) => chat.otherUser._id === userId
            );
            if (selectedChat) {
              setSelectedChatUserId(userId as string);
              setSelectedChatUserDetails(selectedChat.otherUser);
            } else if (userId) {
              const token = localStorage.getItem("userAccessToken");
              const newChatUser = await fetchUserById(
                token as string,
                userId as string
              );
              setSelectedChatUserId(userId as string);
              setSelectedChatUserId(newChatUser.nativeUser);
              setChatUsers([
                {
                  _id: "temp",
                  lastMessage: {
                    _id: "",
                    messageText: "",
                    createdAt: new Date().toISOString(),
                    senderId: "",
                    senderName: "",
                    image: "",
                  },
                  otherUser: newChatUser.nativeUser,
                  unreadMessages: 0,
                },
                ...sortedChats,
              ]);
            } else {
              setSelectedChatUserId(sortedChats[0].otherUser._id);
              setSelectedChatUserDetails(sortedChats[0].otherUser);
              router.push(`/chat/${sortedChats[0].otherUser._id}`);
            }
          } else if (userId) {
            const token = localStorage.getItem("userAccessToken");
            const newChatUser = await fetchUserById(
              token as string,
              userId as string
            );
            setSelectedChatUserId(userId as string);
            setSelectedChatUserId(newChatUser.nativeUser);
            setChatUsers([
              {
                _id: "temp",
                lastMessage: {
                  _id: "",
                  messageText: "",
                  createdAt: new Date().toISOString(),
                  senderId: "",
                  senderName: "",
                  image: "",
                  audio: "",
                },
                otherUser: newChatUser.nativeUser,
                unreadMessages: 0,
              },
              ...sortedChats,
            ]);
          } else {
            setChatUsers([]);
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response && error.response.status === 403) {
              toast.error("User is blocked");
              logout();
            }
          }
          console.error("Error fetching user chats:", error);
        }
      }
    };

    fetchUserChats();
  }, [currentUserId, userId]);

  useEffect(() => {
    if (!socket) {
      console.log("initializing in page");
      initializeSocket();
    }

    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  const handleUserClick = (userId: string) => {
    const clickedUser = chatUsers.find(
      (chatUser) => chatUser.otherUser._id === userId
    );
    if (clickedUser) {
      setSelectedChatUserId(userId);
      setSelectedChatUserDetails(clickedUser.otherUser);
    }
  };

  const handleNewMessage = (userId: string, newMessage: LastMessage) => {
    setChatUsers((prevChats) => {
      const updatedChats = prevChats.map((chat) => {
        if (chat.otherUser._id === userId) {
          return {
            ...chat,
            lastMessage: newMessage,
            unreadMessages:
              userId !== selectedChatUserId
                ? (chat.unreadMessages || 0) + 1
                : 0,
          };
        }
        return chat;
      });

      return updatedChats.sort(
        (a, b) =>
          new Date(b.lastMessage.createdAt).getTime() -
          new Date(a.lastMessage.createdAt).getTime()
      );
    });
  };

  const handleMessagesRead = (userId: string) => {
    setChatUsers((prevChats) =>
      prevChats.map((chat) =>
        chat.otherUser._id === userId ? { ...chat, unreadMessages: 0 } : chat
      )
    );
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(event.target.value);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();

    router.push(`/group/${roomId}`);
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans relative">
      <UserNav />
      <main className="flex-1 flex flex-col p-8 overflow-hidden">
        {ongoingCall && (
          <div className="absolute inset-0 z-50 ">
            <CallNotification />
            <Videocall />
          </div>
        )}

        <div className="flex justify-end mb-4">
          <button
            onClick={handleOpenModal}
            className="bg-yellow-400 text-black py-2 px-4 rounded-lg hover:bg-yellow-500 transition duration-300"
          >
            Join a conference meeting
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/4 bg-gray-800 rounded-lg p-4 mr-4 overflow-y-auto">
            <div>
              <h1 className="text-4xl font-bold mb-8 flex items-center">
                <IoIosChatbubbles className="mr-3 text-yellow-400" /> Your Chats
              </h1>
            </div>
            {chatUsers.length || selectedChatUserId ? (
              <ul>
                {chatUsers.map((chatUser) => (
                  <li
                    key={chatUser.otherUser._id}
                    className={`flex items-center mb-4 p-2 rounded-lg cursor-pointer transition duration-300 ${
                      selectedChatUserId === chatUser.otherUser._id
                        ? "bg-yellow-400 text-black"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={() => handleUserClick(chatUser.otherUser._id)}
                  >
                    
                    <img
                      className="w-10 h-10 rounded-full mr-3"
                      src={
                        chatUser.otherUser.profilePhoto ||
                        "/default-profile.jpg"
                      }
                      alt={chatUser.otherUser.username}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">
                        {chatUser.otherUser.username.charAt(0).toUpperCase() +
                          chatUser.otherUser.username.slice(1)}
                      </div>
                      {chatUser.lastMessage.image ? (
                        <div className="text-sm opacity-75">
                          {chatUser.lastMessage.senderId === currentUserId
                            ? "Me"
                            : chatUser.lastMessage.senderName}
                          : <span>📷 Photo</span>
                        </div>
                      ) : chatUser.lastMessage.audio ? ( 
                        <div className="text-sm opacity-75">
                          {chatUser.lastMessage.senderId === currentUserId
                            ? "Me"
                            : chatUser.lastMessage.senderName}
                          : <span>🎵 Audio Message</span>
                        </div>
                      ) : chatUser.lastMessage.messageText ? (
                        <div className="text-sm opacity-75">
                          {chatUser.lastMessage.senderId === currentUserId
                            ? "Me"
                            : chatUser.lastMessage.senderName}
                          : {chatUser.lastMessage.messageText}
                        </div>
                      ) : null}
                    </div>
                    {chatUser.unreadMessages > 0 && (
                      <div className="ml-3 px-2 py-1 bg-gray-900 text-white text-sm rounded-3xl flex float-end">
                        {chatUser.unreadMessages}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div>
                No chat yet{" "}
                <span
                  className="text-yellow-400 underline cursor-pointer"
                  onClick={() => router.push("/connect")}
                >
                  show connections
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 bg-gray-800 rounded-lg p-4 overflow-y-auto">
            {currentUserId && selectedChatUserId ? (
              <CheckChat
                currentUserId={currentUserId}
                otherUserId={selectedChatUserId}
                otherUserDetails={selectedChatUserDetails as User}
                onNewMessage={handleNewMessage}
                onMessagesRead={handleMessagesRead}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <FaUsers className="text-yellow-400 text-6xl mb-4" />
                <p className="text-xl text-center">
                  Select a chat to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-1/3">
            <form onSubmit={handleCreateGroup}>
              <h2 className="text-2xl font-bold mb-4">Enter a conference meeting</h2>
              <input
                type="text"
                value={roomId}
                onChange={handleInputChange}
                placeholder="Enter meeting code"
                className="w-full px-3 py-2 mb-4 border border-gray-700 rounded-lg bg-gray-800 text-white"
              />
              <div className="flex justify-end">
                <button
                  className="bg-yellow-400 text-black py-2 px-4 rounded-lg hover:bg-yellow-500 transition duration-300 mr-2"
                  type="submit"
                >
                  Enter
                </button>
                <button
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-300"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtectedRoute(page);
