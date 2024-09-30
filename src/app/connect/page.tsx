"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { checkBlock, fetchUser } from "../../services/userApi";
import Image from "next/image";
import BlankProfile from "../../../public/asset/blankprofilpicture.webp";
import { FaUsers, FaSearch } from "react-icons/fa";
import { IoIosChatbubbles } from "react-icons/io";
import ProtectedRoute from "@/HOC/ProtectedRoute";
import useAuthStore from "@/store/authStore";
import LoadingPage from "@/components/Loading";
import UserNav from "@/components/UserNav";
import axios from "axios";

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
  connections: User[];
}

const ConnectionsPage = () => {
  const [user, setCurrentUser] = useState<User>();
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { isAuthenticated, isLoading, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");

    const checking = async () => {
      try {
        const check = await checkBlock(token as string);
        console.log(check);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            if (error.response.status === 403) {
              toast.error("User is blocked");
              localStorage.removeItem("userAccessToken");
              router.push("/login");
            }
          } else {
            toast.error("An unexpected error occurred in login");
          }
        } else {
          toast.error("An error occurred during login. Please try again.");
        }
      }
    };

    checking();
  }, []);

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
        const data = await fetchUser(token);
        setCurrentUser(data);
      } catch (error) {
        handleFetchError(error);
      }
    };

    const handleFetchError = (error: any) => {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 403) {
          toast.error("User is blocked");
          logout();
        }
      }
      if (error.response?.status === 401) {
        localStorage.removeItem("userAccessToken");
        localStorage.removeItem("user");
        toast.error("Token expired...Login again!");
        router.push("/login");
      } else {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [router, setUser]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const filteredConnections = user?.connections.filter((connection) =>
    connection.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white font-sans">
      <UserNav />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto lg:ml-24">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 flex items-center justify-center md:justify-start">
          <FaUsers className="mr-3 text-yellow-400" /> Your Connections
        </h1>

        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-4 md:p-6 mb-6 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div className="relative w-full md:w-auto md:flex-grow max-w-md">
                <input
                  type="text"
                  placeholder="Search connections..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={() => router.push("/nativeSpeakers")}
                className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-full transition-colors duration-300 flex items-center justify-center"
              >
                <FaUsers className="mr-2" /> Find New Connections
              </button>
            </div>

            {filteredConnections && filteredConnections.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredConnections.map((connection) => (
                  <div
                    key={connection?._id}
                    className="bg-gray-700 rounded-lg p-4 md:p-6 flex flex-col justify-between shadow-lg transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="flex items-center mb-4">
                      <Image
                        src={connection.profilePhoto || BlankProfile}
                        alt="Profile Picture"
                        width={60}
                        height={60}
                        className="rounded-full object-cover mr-4"
                      />
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold text-white">
                          {connection.username}
                        </h3>
                        <p className="text-sm text-gray-300">
                          {connection.country?.countryName}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
                      <button
                        className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-full transition-colors duration-300 flex items-center justify-center"
                        onClick={() =>
                          router.push(`/connect/${connection?._id}`)
                        }
                      >
                        <IoIosChatbubbles className="mr-2" /> Chat
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/nativeSpeakers/${connection?._id}`)
                        }
                        className="w-full sm:w-auto bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-300 flex items-center justify-center"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaUsers className="mx-auto text-gray-400 text-5xl mb-4" />
                <p className="text-gray-300 text-xl mb-4">
                  No connections found.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default ProtectedRoute(ConnectionsPage);
