"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaUser, FaEdit } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { SiNationalrail, SiNativescript } from "react-icons/si";
import { IoLanguage } from "react-icons/io5";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import UserNav from "@/components/UserNav";
import useAuthStore from "@/store/authStore";
import ProtectedRoute from "@/HOC/ProtectedRoute";
import { checkBlock, fetchUser } from "@/services/userApi";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Country {
  _id: string;
  countryName: string;
  isBlocked: boolean;
}

interface Language {
  _id: string;
  languageName: string;
}

interface User {
  username?: string;
  email?: string;
  country?: Country;
  nativeLanguage?: Language;
  knownLanguages?: Language[];
  languagesToLearn?: Language[];
  bio?: string;
  profilePhoto?: string;
  coverPhoto?: string;
}

const UserProfile: React.FC = () => {
  const [user, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();
  const { isAuthenticated, setUser, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    const fetchCurrentUser = async () => {
      try {
        const data = await fetchUser(token as string);
        setCurrentUser(data)
        
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            if (error.response.status === 403) {
              toast.error("User is blocked");
              logout()
            }else if (error.response.status === 401) {
              toast.error("Token expired");
              logout()
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




  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white font-sans">
      <UserNav />

      <main className="flex-grow p-4 md:p-8 lg:p-12">
        <div className="flex justify-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center md:text-left">Your Profile</h1>

        </div>
       

        <div className="bg-gray-800 rounded-lg p-4 md:p-8 shadow-lg w-full max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="w-full md:w-1/3 flex flex-col items-center mb-8 md:mb-0">
              <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full bg-gray-700 overflow-hidden mb-4">
                {user?.profilePhoto ? (
                  <Image
                    src={user.profilePhoto}
                    alt="Profile"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    <FaUser size={64} className="text-gray-400" />
                  </div>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-yellow-400 mb-4 text-center">
                {user?.username || "Username"}
              </h2>
              <Link href="/profile/editProfile">
                <button className="bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 rounded-full flex items-center text-sm md:text-base">
                  <FaEdit className="mr-2" /> Edit Profile
                </button>
              </Link>
            </div>

            <div className="w-full md:w-2/3 md:pl-8">
              <h3 className="text-xl md:text-2xl font-bold mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <InfoItem icon={<MdEmail className="text-yellow-400" />} label="Email" value={user?.email} />
                <InfoItem icon={<SiNationalrail className="text-yellow-400" />} label="Country" value={user?.country?.countryName} />
                <InfoItem icon={<SiNativescript className="text-yellow-400" />} label="Native Language" value={user?.nativeLanguage?.languageName} />
                <InfoItem icon={<IoLanguage className="text-yellow-400" />} label="Known Languages" value={user?.knownLanguages?.map(lang => lang.languageName).join(", ")} />
                <InfoItem icon={<IoLanguage className="text-yellow-400" />} label="Languages to Learn" value={user?.languagesToLearn?.map(lang => lang.languageName).join(", ")} />
              </div>

              <div className="mt-6 md:mt-8">
                <h3 className="text-xl md:text-2xl font-bold mb-4">Bio</h3>
                <p className="text-gray-300 text-sm md:text-base">{user?.bio || "No bio provided"}</p>
              </div>
            </div>
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

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-center">
    <div className="mr-3">{icon}</div>
    <div>
      <span className="text-gray-400 text-xs md:text-sm">{label}</span>
      <p className="font-semibold text-white text-sm md:text-base">{value || "Not provided"}</p>
    </div>
  </div>
);
export default ProtectedRoute(UserProfile);
