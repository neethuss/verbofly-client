"use client";

import React, { useEffect, useState } from "react";

import { useParams } from "next/navigation";
import { fetchCategories } from "@/services/categoryApi";
import UserNav from "@/components/UserNav";
import { fetchLanguageById } from "@/services/languageApi";
import { FaLock, FaBookOpen, FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { User } from "@/Types/chat";
import axios from "axios";
import { fetchUser } from "@/services/userApi";
import { toast } from "react-toastify";

interface ICategory {
  _id: string;
  categoryName: string;
  isBlocked:boolean
}

interface ILanguage {
  _id: string;
  languageName: string;
}

const QuizLanguagePage = () => {
  const { languageId } = useParams();
  const [currentUser, setCurrentUser] = useState<User>()
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [language, setLanguage] = useState<ILanguage>()
  const [subscribed, setSubscribed] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)

  const router = useRouter()
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    const fetchCurrentUser = async () => {
      try {
        const data = await fetchUser(token as string);
        setCurrentUser(data)
        setSubscribed(data.isSubscribed)
        
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

    const fetchLanguageDataById = async() => {
      const data = await fetchLanguageById(token as string, languageId as string)
      setLanguage(data)
    }

    const fetchCategoriesData = async () => {
      const data = await fetchCategories(token as string);
     const categories = data.categories.filter((category:ICategory)=> !category.isBlocked)
      setCategories(data.categories);
    };

    fetchLanguageDataById()
    fetchCategoriesData();
  },[languageId, router]);

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    if (categoryName.toLowerCase() === 'beginner' || subscribed) {
      router.push(`/quiz/${languageId}/${categoryId}`);
    } else {
      router.push('/subscription');
    }
  };

  const isLocked = (categoryName: string) => {
    return !subscribed;
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'beginner': return <FaBookOpen className="text-4xl text-yellow-400" />;
      case 'intermediate': return <FaUserGraduate className="text-4xl text-yellow-400" />;
      case 'advanced': return <FaChalkboardTeacher className="text-4xl text-yellow-400" />;
      default: return null;
    }
  }

  const getCategoryDescription = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'beginner':
        return 'Build a strong foundation with essential vocabulary and basic grammar.';
      case 'intermediate':
        return 'Enhance your skills with advanced topics and practical conversations.';
      case 'advanced':
        return 'Master the language with complex grammar, idioms, and cultural insights.';
      default:
        return '';
    }
  };

  const handleOpenModal = () => setShowModal(true)
  const handleCloseModal = () => setShowModal(false)

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      <UserNav />

      <main className="flex flex-1 flex-col items-center p-8">
        <h1 className="text-4xl font-bold mb-8">
          Explore{" "}
          <span className="text-yellow-400">{language?.languageName}</span>{" "}
          Categories
        </h1>
        <p className="text-xl text-center mb-12 max-w-3xl">
          Choose your proficiency level and embark on an exciting language
          journey!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {categories.map((category) => (
            <div
              key={category._id}
              onClick={() =>
                handleCategoryClick(category._id, category.categoryName)
              }
              className={`bg-gray-800 rounded-lg p-6 flex flex-col items-center shadow-lg transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${
                isLocked(category.categoryName) ? "opacity-90" : ""
              }`}
            >
              <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gray-700 mb-4 relative">
                {getCategoryIcon(category.categoryName)}
                {isLocked(category.categoryName) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-full">
                    <FaLock className="text-3xl text-yellow-400" />
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {category.categoryName}
              </h3>
              <p className="text-center mb-4 text-gray-300">
                {getCategoryDescription(category.categoryName)}
              </p>
              {isLocked(category.categoryName) ? (
                <div className="mt-auto flex flex-col items-center">
                  <FaLock className="text-3xl text-yellow-400 mb-2" />
                  <span className="text-yellow-400 font-bold">Unlock</span>
                </div>
              ) : (
                <button className="mt-auto bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 rounded-full">
                  Start Quiz
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default QuizLanguagePage;
