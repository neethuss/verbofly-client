"use client";

import { FaLanguage } from "react-icons/fa";
import UserNav from "@/components/UserNav";
import ProtectedRoute from "@/HOC/ProtectedRoute";
import { useEffect, useState } from "react";
import { fetchLanguages } from "@/services/languageApi";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { checkBlock, fetchUser } from "@/services/userApi";
import { useRouter } from "next/navigation";
import axios from "axios";
import { User } from "@/Types/chat";
import useAuthStore from "@/store/authStore";

interface ICountry {
  _id: string;
  countryName: string;
}

interface ILanguage {
  _id: string;
  languageName: string;
  countries: ICountry[];
}

const Quiz: React.FC = () => {
  const {logout} = useAuthStore()
  const [currentUser, setCurrenctUser] = useState<User>()
  const [languages, setLanguages] = useState<ILanguage[]>([]);

  const router = useRouter()

  
  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    const fetchCurrentUser = async () => {
      console.log('useEffect in subscription')
      try {
        const data = await fetchUser(token as string);
        setCurrenctUser(data)
        
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
  
  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    const fetchLanguagesData = async () => {
      const data = await fetchLanguages(token as string);
      setLanguages(data.languages);
    };
    fetchLanguagesData()
  },[]);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      <UserNav />

      <main className="flex flex-1 flex-col items-center p-8">
        <div className="flex items-center justify-center mb-8 bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-left">
            <h1 className="text-4xl font-bold mb-2">
              Play quizzes to enhance your learning exprience
            </h1>
            <p className="text-xl text-gray-400">
              Select a language to start your journey
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {languages.map((language) => (
            <Link href={`/quiz/${language._id}`} key={language._id}>
              <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center shadow-lg transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                <FaLanguage className="text-yellow-400 text-4xl mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  {language.languageName}
                </h2>
                <p className="text-center mb-4">
                  Spoken in {language.countries.length}{" "}
                  {language.countries.length === 1 ? "country" : "countries"}
                </p>
                <button className="mt-auto bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 rounded-full">
                  Start Learning
                </button>
              </div>
            </Link>
          ))}
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
      </main>
    </div>
  );
};

export default ProtectedRoute(Quiz);
