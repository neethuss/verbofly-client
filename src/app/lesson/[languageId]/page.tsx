"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBookOpen } from 'react-icons/fa';
import ProtectedRoute from '@/HOC/ProtectedRoute'
import UserNav from '@/components/UserNav';
import useAuthStore from '@/store/authStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Language {
  _id: string;
  languageName: string;
  isBlocked: boolean;
}

const LessonPage = () => {
  const [language, setLanguage] = useState<Language>();
  const router = useRouter();
  const { languageId } = useParams();
  const {logout} = useAuthStore()

  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/languages/${languageId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("userAccessToken")}` },
        });
        setLanguage(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status === 403) {
            toast.error("User is blocked");
            logout()
          }
        }
        handleError(error);
      }
    };
    fetchLanguage();
  }, [languageId]);

  const handleError = (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("userAccessToken");
      localStorage.removeItem("user");
      toast.error("Session expired. Please log in again.");
      router.push("/login");
    } else {
      console.error("An error occurred:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      <UserNav/>

      <main className="flex flex-1 flex-col justify-center items-center p-8">
        <h1 className="text-4xl font-bold mb-8">
          Welcome to <span className="text-yellow-400">{language?.languageName} </span>Learning
        </h1>
        <p className="text-xl text-center mb-12 max-w-3xl">
          Are you ready to embark on an exciting language journey?
        </p>

        <div className="w-full max-w-md">
          <div 
            onClick={() => router.push(`/lesson/${languageId}/categories`)}
            className="bg-gray-800 rounded-lg p-6 flex flex-col items-center shadow-lg transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
          >
            <FaBookOpen className="text-yellow-400 text-4xl mb-4" />
            <h2 className="text-2xl font-bold mb-2">Start Your Lesson</h2>
            <p className="text-center mb-4">
              Begin your language learning journey with interactive lessons and exercises.
            </p>
            <button className="mt-auto bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 rounded-full">
              Let's Go!
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProtectedRoute(LessonPage);