"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Head from "next/head";
import {
  acceptConnectionRequest,
  cancelConnectionRequest,
  fetchUser,
  fetchUserById,
  rejectConnectionRequest,
  sendConnectionRequest,
} from "@/services/userApi";
import UserNav from "@/components/UserNav";
import ProtectedRoute from "@/HOC/ProtectedRoute";
import useAuthStore from "@/store/authStore";
import { FaUsers } from "react-icons/fa";
import { GiProgression } from "react-icons/gi";
import axios from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import { useSocketStore } from "@/store/socketStore";
import LoadingPage from "@/components/Loading";
import { FaUser } from "react-icons/fa6";

interface Country {
  countryName: string;
}

interface Language {
  languageName: string;
  countries: Country[];
}

interface User {
  _id: string;
  username: string;
  email: string;
  profilePhoto: string;
  country: Country;
  nativeLanguage: Language;
  knownLanguages: Language[];
  languagesToLearn: Language[];
  bio: string;
  connections: string[];
  sentRequests: string[];
  receivedRequests: string[];
}

const Page = () => {
  const [userNow, setUser] = useState<User>();
  const [currentUser, setCurrentUser] = useState<User>();
  const [connectionStatus, setConnectionStatus] = useState<string>("Connect");
  const [showAcceptReject, setShowAcceptReject] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loadingUser, setLoadingUser] = useState<boolean>(false);

  const { logout, user } = useAuthStore();
  const { emitConnectionAccept, emitConnectionRequest } = useSocketStore();
  const { nativeId } = useParams();
  const router = useRouter();

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    const fetchCurrentUser = async () => {
      try {
        const data = await fetchUser(token as string);
        setUser(data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            if (error.response.status === 403) {
              toast.error("User is blocked");
              logout();
            } else if (error.response.status === 401) {
              toast.error("Token expired");
              logout();
            }
          } else {
            toast.error("An unexpected error occurred in login");
          }
        } else {
          toast.error("An error occurred during login. Please try again.");
        }
      }
    };
    fetchCurrentUser();
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    const userId = user?._id;
    const fetchUserData = async () => {
      try {
        setLoadingUser(true);
        const data = await fetchUserById(token as string, nativeId as string);
        setCurrentUser(data.nativeUser);
        const connected = data.nativeUser.connections.some(
          (connection: User) => connection._id === userId
        );
        const hasSentRequest = data.nativeUser.sentRequests.some(
          (request: User) => request._id === userId
        );
        const hasReceivedRequest = data.nativeUser.receivedRequests.some(
          (request: User) => request._id === userId
        );

        setIsConnected(connected);
        
        if (connected) {
          setConnectionStatus("Chat");
          setShowAcceptReject(false);
        } else if (hasSentRequest) {
          setConnectionStatus("Accept");
          setShowAcceptReject(true);
        } else if (hasReceivedRequest) {
          setConnectionStatus("Cancel Request");
          setShowAcceptReject(false);
        } else {
          setConnectionStatus("Connect");
          setShowAcceptReject(false);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    const fetchUserrData = async () => {
      const data = await fetchUser(token as string);
      setUser(data);
    };

    fetchUserData();
    fetchUserrData();
  }, [nativeId, setUser, user?._id]);

  const handleConnectionAction = async (action: string) => {
    const token = localStorage.getItem("userAccessToken");
    const userId = currentUser?._id as string;

    if (action === "Chat") {
      router.push(`/connect/${userId}`);
      return;
    }

    try {
      setLoadingUser(true);
      switch (action) {
        case "Accept":
          emitConnectionAccept(
            currentUser?._id as string,
            userNow?._id as string,
            userNow?.username as string
          );
          await acceptConnectionRequest(token as string, userId);
          setConnectionStatus("Chat");
          setShowAcceptReject(false);
          setIsConnected(true);
          break;
        case "Reject":
          await rejectConnectionRequest(token as string, userId);
          setConnectionStatus("Connect");
          setShowAcceptReject(false);
          break;
        case "Cancel Request":
          await cancelConnectionRequest(token as string, userId);
          setConnectionStatus("Connect");
          setShowAcceptReject(false);
          break;
        case "Connect":
          emitConnectionRequest(
            currentUser?._id as string,
            userNow?._id as string,
            userNow?.username as string
          );
          await sendConnectionRequest(token as string, userId);
          setConnectionStatus("Cancel Request");
          setShowAcceptReject(false);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error handling connection action:", error);
      toast.error("Failed to perform action. Please try again.");
    } finally {
      setLoadingUser(false);
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (loadingUser) {
    return <LoadingPage />;
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      <Head>
        <title>VerboFly - User Profile</title>
        <meta name="description" content="User profile on VerboFly" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <UserNav />
      <main className="flex flex-1 flex-col justify-center items-center p-8">
        <h1 className="text-4xl font-bold mb-8">User Profile</h1>
        <div className="bg-gray-800 rounded-lg p-8 w-full max-w-4xl shadow-lg">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {currentUser?.profilePhoto ? (
              <Image
                src={currentUser?.profilePhoto}
                alt="User Profile"
                className="w-32 h-32 object-cover rounded-full border-4 border-yellow-400"
                width={128}
                height={128}
                unoptimized={true}
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <FaUser size={64} className="text-gray-400" />
              </div>
            )}

            <div className="flex-grow text-center md:text-left">
              <h2 className="text-3xl font-bold text-yellow-400">
                {capitalizeFirstLetter(currentUser?.username || "")}
              </h2>
              <p className="text-gray-300 mt-2">{currentUser?.bio}</p>
            </div>
            <div className="flex flex-col space-y-2">
              {showAcceptReject ? (
                <>
                  <button
                    onClick={() => handleConnectionAction("Accept")}
                    className="py-2 px-6 rounded-full font-bold text-sm uppercase bg-green-500 hover:bg-green-600 text-white"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleConnectionAction("Reject")}
                    className="py-2 px-6 rounded-full font-bold text-sm uppercase bg-red-500 hover:bg-red-600 text-white"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleConnectionAction(connectionStatus)}
                  className={`py-2 px-6 rounded-full font-bold text-sm uppercase ${
                    connectionStatus === "Connect"
                      ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                      : connectionStatus === "Cancel Request"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : connectionStatus === "Chat" 
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {connectionStatus}
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 rounded-lg p-6 flex flex-col items-center shadow-md transition duration-300 transform hover:-translate-y-1 hover:shadow-xl">
              <FaUsers className="text-yellow-400 text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">Language Details</h3>
              <p>
                <strong>Native:</strong>{" "}
                {currentUser?.nativeLanguage?.languageName || 'NA'} 
              </p>
              <p>
                <strong>Known:</strong>{" "}
                {currentUser?.knownLanguages
                  .map((lang) => lang.languageName)
                  .join(", ") || 'NA'}
              </p>
              <p>
                <strong>Learning:</strong>{" "}
                {currentUser?.languagesToLearn
                  .map((lang) => lang.languageName)
                  .join(", ") || 'NA'}
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6 flex flex-col items-center shadow-md transition duration-300 transform hover:-translate-y-1 hover:shadow-xl">
              <GiProgression className="text-yellow-400 text-4xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Profile Information
              </h3>
              <p>
                <strong>Country:</strong> {currentUser?.country?.countryName || 'NA'}
              </p>
              <p
                onClick={handleOpenModal}
                className="hover:text-yellow-400 hover:underline cursor-pointer"
              >
                <strong>Connections:</strong> {currentUser?.connections.length}
              </p>
              <p>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProtectedRoute(Page);