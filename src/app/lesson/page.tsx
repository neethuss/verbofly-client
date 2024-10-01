"use client";

import Image from "next/image";
import LanguageSelector from "@/components/lanuageSelector";
import Trynew from "../../../public/asset/Trynew.png";
import UserNav from "@/components/UserNav";
import ProtectedRoute from "@/HOC/ProtectedRoute";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { checkBlock, fetchUser } from "@/services/userApi";
import { User } from "@/Types/chat";
import useAuthStore from "@/store/authStore";

const Lesson: React.FC = () => {
  const router = useRouter();
const {logout} = useAuthStore()
  const [currentUser, setCurrentUser] = useState<User>()

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    const fetchCurrentUser = async () => {
      console.log('useEffect in subscription')
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

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="sticky top-0 z-10 flex flex-col md:flex-row items-center justify-center mb-8 bg-gray-800 p-4 md:p-6 rounded-lg shadow-md">
            <Image
              src={Trynew}
              alt="Language Learning"
              width={100}
              height={100}
              className="mb-4 md:mb-0 md:mr-6"
            />
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">
                Wanna Try New Languages?
              </h1>
              <p className="text-lg md:text-xl text-gray-400">
                Select a language to start your journey
              </p>
            </div>
          </div>

          <LanguageSelector />
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

export default ProtectedRoute(Lesson);
