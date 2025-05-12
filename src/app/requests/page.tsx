"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import {
  acceptConnectionRequest,
  cancelConnectionRequest,
  fetchUser,
  rejectConnectionRequest,
  sendConnectionRequest,
} from "../../services/userApi";
import UserNav from "@/components/UserNav";
import ProtectedRoute from "@/HOC/ProtectedRoute";
import useAuthStore from "@/store/authStore";
import { FaUser } from "react-icons/fa";
import { IoMdGlobe } from "react-icons/io";
import { MdLanguage } from "react-icons/md";
import axios from "axios";
import LoadingPage from "@/components/Loading";
import { useSocketStore } from "@/store/socketStore";

interface Country {
  countryName: string;
}

interface Language {
  _id: string;
  languageName: string;
  countries: Country[];
}

interface User {
  _id: string;
  username: string;
  email: string;
  country: Country;
  nativeLanguage: Language;
  profilePhoto: string;
  knownLanguage: Language[];
  languagesToLearn: Language[];
  receivedRequests: User[];
  sentRequests: string[];
  connections: string[];
}

const IncomingRequestsPage = () => {
  const [user, setCurrentUser] = useState<User>();
  const [userId, setUserId] = useState<string | null>(null);
  const [buttonStates, setButtonStates] = useState<
    Record<string, { text: string; color: string }>
  >({});
  const router = useRouter();
  const { setUser, logout } = useAuthStore();
  const { emitConnectionAccept, emitConnectionRequest } = useSocketStore();
  const [loadingRequests, setLoadingRequests] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    const user = localStorage.getItem("user");
    setUser(user);

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoadingRequests(true);
        const data = await fetchUser(token);
        setCurrentUser(data);

        const userString = localStorage.getItem("user");
        const userObject = userString ? JSON.parse(userString) : null;
        setUserId(userObject?._id || null);

        const initialButtonStates: Record<
          string,
          { text: string; color: string }
        > = {};

        data.receivedRequests.forEach((request: User) => {
          const isConnected = data.connections.includes(request._id);
          const hasSentRequest = data.sentRequests.includes(request._id);

          let buttonText = "Connect";
          let buttonColor = "bg-yellow-400 hover:bg-yellow-500 text-black";

          if (isConnected) {
            buttonText = "Message";
            buttonColor = "bg-yellow-400 hover:bg-yellow-500 text-black";
          } else if (hasSentRequest) {
            buttonText = "Cancel request";
            buttonColor = "bg-red-500 hover:bg-red-600 text-white";
          } else {
            buttonText = "Accept";
            buttonColor = "bg-green-500 hover:bg-green-600 text-white";
          }

          initialButtonStates[request._id] = {
            text: buttonText,
            color: buttonColor,
          };
        });

        setButtonStates(initialButtonStates);
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
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchData();
  }, [router, setUser, logout]);

  const handleClick = async (buttonText: string, requestId: string) => {
    const token = localStorage.getItem("userAccessToken");

    try {
      switch (buttonText) {
        case "Accept":
          emitConnectionAccept(
            requestId,
            user?._id as string,
            user?.username as string
          );
          await acceptConnectionRequest(token as string, requestId);
          setButtonStates((prev) => ({
            ...prev,
            [requestId]: {
              text: "Message",
              color: "bg-yellow-400 hover:bg-yellow-500 text-black",
            },
          }));
          break;

        case "Reject":
          await rejectConnectionRequest(token as string, requestId);
          setButtonStates((prev) => ({
            ...prev,
            [requestId]: {
              text: "Connect",
              color: "bg-yellow-400 hover:bg-yellow-500 text-black",
            },
          }));
          break;

        case "Connect":
          // Send connection request
          emitConnectionRequest(
            requestId, 
            user?._id as string, 
            user?.username as string
          );
          await sendConnectionRequest(token as string, requestId);
          setButtonStates((prev) => ({
            ...prev,
            [requestId]: {
              text: "Cancel request",
              color: "bg-red-500 hover:bg-red-600 text-white",
            },
          }));
          break;

        case "Cancel request":
          // Cancel connection request
          await cancelConnectionRequest(token as string, requestId);
          setButtonStates((prev) => ({
            ...prev,
            [requestId]: {
              text: "Connect",
              color: "bg-yellow-400 hover:bg-yellow-500 text-black",
            },
          }));
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error handling connection request:", error);
      toast.error("An error occurred while processing the request");
    }
  };

  if (loadingRequests) {
    return <LoadingPage />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white font-sans lg:ml-24">
      <UserNav />

      <main className="flex flex-1 flex-col items-center p-8 sm:mt-2">
        <h1 className="text-4xl font-bold mb-8">Incoming Requests</h1>

        <div className="w-full max-w-4xl">
          {user?.receivedRequests && user.receivedRequests.length > 0 ? (
            <ul className="space-y-6">
              {user.receivedRequests.map((request) => (
                <li
                  key={request._id}
                  className="bg-gray-800 rounded-lg p-6 flex items-center justify-between shadow-lg transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-700 p-3 rounded-full">
                      <FaUser className="text-yellow-400 text-xl" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-yellow-400">
                        {request.username.charAt(0).toUpperCase() +
                          request.username.slice(1)}
                      </p>
                      <p className="text-sm text-gray-300 flex items-center">
                        <IoMdGlobe className="mr-1" />{" "}
                        {request?.country
                          ? request.country.countryName
                              .charAt(0)
                              .toUpperCase() +
                            request.country.countryName.slice(1)
                          : "Country not available"}
                      </p>
                      <p className="text-sm text-gray-300 flex items-center">
                        <MdLanguage className="mr-1" />{" "}
                        {request?.nativeLanguage
                          ? request.nativeLanguage.languageName
                              .charAt(0)
                              .toUpperCase() +
                            request.nativeLanguage.languageName.slice(1)
                          : "Native language not available"}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() =>
                        router.push(`/nativeSpeakers/${request._id}`)
                      }
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full transition duration-300"
                    >
                      View Profile
                    </button>
                    <button
                      className={`${
                        buttonStates[request._id]?.color
                      } py-2 px-4 rounded-full transition duration-300`}
                      onClick={() =>
                        handleClick(
                          buttonStates[request._id]?.text || "Connect",
                          request._id
                        )
                      }
                    >
                      {buttonStates[request._id]?.text || "Connect"}
                    </button>
                    {buttonStates[request._id]?.text === "Accept" && (
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full transition duration-300"
                        onClick={() => handleClick("Reject", request._id)}
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-xl text-gray-300">No incoming requests</p>
            </div>
          )}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
};

export default ProtectedRoute(IncomingRequestsPage);