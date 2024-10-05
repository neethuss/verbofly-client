"use client";

import React, { useEffect, useState } from "react";
import {
  acceptConnectionRequest,
  cancelConnectionRequest,
  fetchNativeSpeakers,
  fetchUser,
  sendConnectionRequest,
} from "../../services/userApi";
import Head from "next/head";
import BlankProfile from "../../../public/asset/blankprofilpicture.webp";
import { useRouter } from "next/navigation";
import UserNav from "@/components/UserNav";
import { fetchLanguages } from "../../services/languageApi";
import { fetchCountries } from "../../services/countryApi";
import ProtectedRoute from "@/HOC/ProtectedRoute";
import useAuthStore from "@/store/authStore";
import { FaSearch, FaUsers } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import Image from "next/image";

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
  connections: string[];
  sentRequests: string[];
  receivedRequests: string[];
}

const Page = () => {
  const { user,logout } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUser, setCurrenctUser] = useState<User>();
  const [buttonStates, setButtonStates] = useState<
    Record<string, { text: string; color: string }>
  >({});
  const [languages, setLanguages] = useState<Language[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(1);
  const [limit] = useState<number>(6);
  const [filterCountry, setFilterCountry] = useState<string>("");
  const [filterLanguage, setFilterLanguage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    const fetchCurrentUser = async () => {
      console.log("useEffect in subscription");
      try {
        const data = await fetchUser(token as string);
        setCurrenctUser(data);
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
    const fetchUsersData = async () => {
      try {
        const data = await fetchNativeSpeakers(
          token as string,
          searchQuery,
          page,
          limit,
          filterCountry,
          filterLanguage
        );
        const userId = user._id;
        setUserId(userId);
        if (data) {
          setUsers(data.users);
          setTotalUsers(data.total);
          const initialButtonStates: Record<
            string,
            { text: string; color: string }
          > = {};
          data.users.forEach((user: User) => {
            const isConnected = user.connections.some(
              (connection) => connection === userId
            );
            const hasSentRequest = user.sentRequests.some(
              (request) => request === userId
            );
            const hasReceivedRequest = user.receivedRequests.some(
              (request) => request === userId
            );

            let buttonText = "Connect";
            let buttonColor = "bg-yellow-400 hover:bg-yellow-500 text-black";

            if (isConnected) {
              buttonText = "Message";
              buttonColor = "bg-yellow-400 hover:bg-yellow-500 text-black";
            } else if (hasSentRequest) {
              buttonText = "Accept";
              buttonColor = "bg-green-500 hover:bg-green-600 text-white";
            } else if (hasReceivedRequest) {
              buttonText = "Cancel request";
              buttonColor = "bg-red-500 hover:bg-red-600 text-white";
            }

            initialButtonStates[user._id] = {
              text: buttonText,
              color: buttonColor,
            };
          });
          setButtonStates(initialButtonStates);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    const fetchLanguagesData = async () => {
      const token = localStorage.getItem("userAccessToken");
      try {
        const data = await fetchLanguages(token as string);
        setLanguages(data.languages);
      } catch (error) {
        console.error("Failed to fetch languages:", error);
      }
    };

    const fetchCountriesData = async () => {
      const token = localStorage.getItem("userAccessToken");
      try {
        const data = await fetchCountries(token as string);
        setCountries(data.countries);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };

    fetchUsersData();
    fetchLanguagesData();
    fetchCountriesData();
  }, [searchQuery, filterCountry, filterLanguage, page, user.user._id, limit]);

  const totalPages = Math.ceil(totalUsers / limit);

  const handleNativeView = (id: string) => {
    router.push(`/nativeSpeakers/${id}`);
  };

  const handleClick = async (buttonText: string, userId: string) => {
    const token = localStorage.getItem("userAccessToken");

    switch (buttonText) {
      case "Accept":
        await acceptConnectionRequest(token as string, userId);
        setButtonStates((prev) => ({
          ...prev,
          [userId]: {
            text: "Message",
            color: "bg-yellow-400 hover:bg-yellow-500 text-black",
          },
        }));
        break;

      case "Cancel request":
        await cancelConnectionRequest(token as string, userId);
        setButtonStates((prev) => ({
          ...prev,
          [userId]: {
            text: "Connect",
            color: "bg-yellow-400 hover:bg-yellow-500 text-black",
          },
        }));
        break;

      case "Connect":
        await sendConnectionRequest(token as string, userId);
        setButtonStates((prev) => ({
          ...prev,
          [userId]: {
            text: "Cancel request",
            color: "bg-red-500 hover:bg-red-600 text-white",
          },
        }));
        break;

      default:
        break;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white font-sans">
      <Head>
        <title>TalkTrek - Find Native Speakers</title>
        <meta name="description" content="Find native speakers on TalkTrek" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <UserNav />
      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Find Native Speakers
        </h1>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="col-span-3 md:col-span-1">
              <div className="bg-[#1e293b] p-4 rounded-lg flex items-center h-32">
                <FaUsers className="w-10 h-10 mr-4" />
                <div>
                  <p className="text-lg font-semibold">Total Native Speakers</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
              </div>
            </div>
            <div className="col-span-3 md:col-span-2">
              <div className="bg-[#1e293b] p-4 rounded-lg h-32 flex flex-col justify-between">
                <div className="flex items-center mb-4">
                  <FaSearch className="mr-2" />
                  <input
                    type="text"
                    placeholder="Search native speakers..."
                    className="w-full p-2 rounded-lg bg-[#2d3748] text-white placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <select
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="w-1/2 p-2 rounded-lg bg-[#2d3748] text-white"
                  >
                    <option value="">Select Country</option>
                    {countries.map((country, index) => (
                      <option key={index} value={country.countryName}>
                        {country.countryName}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="w-1/2 p-2 rounded-lg bg-[#2d3748] text-white"
                  >
                    <option value="">Select Language</option>
                    {languages.map((language, index) => (
                      <option key={index} value={language.languageName}>
                        {language.languageName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {users.map((user) => {
              const { text: buttonText, color: buttonColor } = buttonStates[
                user._id
              ] || {
                text: "Connect",
                color: "bg-yellow-400 hover:bg-yellow-500 text-black",
              };

              return (
                <div
                  key={user._id}
                  className="bg-[#1e293b] rounded-lg overflow-hidden shadow-lg"
                >
                  <div className="h-48 overflow-hidden">
                    <Image
                      src={user.profilePhoto || BlankProfile.src}
                      alt={`${user.username}'s profile`}
                      className="w-full h-full object-cover"
                      width={500}
                      height={500}
                      objectFit="cover"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2">
                      {user.username.charAt(0).toUpperCase() +
                        user.username.slice(1)}
                    </h2>
                    {user?.country?.countryName && (
                      <p className="text-gray-300 mb-1">
                        Country: {user.country.countryName}
                      </p>
                    )}
                    {user?.nativeLanguage?.languageName && (
                      <p className="text-gray-300 mb-4">
                        Native Language: {user.nativeLanguage.languageName}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleClick(buttonText, user._id)}
                        className={`font-bold text-center uppercase transition-all text-xs py-2 px-4 rounded-lg ${buttonColor}`}
                      >
                        {buttonText}
                      </button>
                      <button
                        onClick={() => handleNativeView(user._id)}
                        className="text-yellow-400 hover:text-yellow-500 underline"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <div className="flex items-center space-x-4">
              <button
                className="px-4 py-2 bg-[#1e293b] rounded-md disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                className="px-4 py-2 bg-[#1e293b] rounded-md disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProtectedRoute(Page);
