"use client"

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBookOpen, FaUserGraduate, FaChalkboardTeacher, FaLock } from 'react-icons/fa';
import { fetchCategories } from '@/services/categoryApi';
import ProtectedRoute from '@/HOC/ProtectedRoute'
import useAuthStore from '@/store/authStore';
import UserNav from '@/components/UserNav';

interface Category {
  _id: string;
  categoryName: string;
  isBlocked: boolean;
}

interface Language {
  id: string;
  languageName: string;
}

const CategoryPage = () => {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [language, setLanguage] = useState<Language>();
  const [subscribed, setSubscribed] = useState(false)
  const router = useRouter();
  const { languageId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("userAccessToken")
        const data = await fetchCategories(token as string)
        if(data){
          setCategories(data.categories)
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.error("Token expired or unauthorized. Redirecting to login...");
          localStorage.removeItem("userAccessToken");
          localStorage.removeItem("user");
          toast.error("Token expired...Login again!");
          router.push("/login");
        } else {
          console.error("Error fetching categories data:", error);
        }
      }
    };

    setSubscribed(user.user.isSubscribed);

    fetchData();
  }, [languageId, router, user?.user?.isSubscribed]);

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'beginner': return <FaBookOpen className="text-4xl text-yellow-400" />;
      case 'intermediate': return <FaUserGraduate className="text-4xl text-yellow-400" />;
      case 'advanced': return <FaChalkboardTeacher className="text-4xl text-yellow-400" />;
      default: return null;
    }
  }

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    if (categoryName.toLowerCase() === 'beginner' || subscribed) {
      router.push(`/lesson/${languageId}/categories/${categoryId}`);
    } else {
      router.push('/subscription');
    }
  };

  const isLocked = (categoryName: string) => {
    return categoryName.toLowerCase() !== 'beginner' && !subscribed;
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      <UserNav/>

      <main className="flex flex-1 flex-col items-center p-8 lg:ml-24 md:ml-20">
        <h1 className="text-4xl font-bold mb-8">
          Explore <span className="text-yellow-400">{language?.languageName}</span> Categories
        </h1>
        <p className="text-xl text-center mb-12 max-w-3xl">
          Choose your proficiency level and embark on an exciting language journey!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {categories.map(category => (
            <div
              key={category._id}
              onClick={() => handleCategoryClick(category._id, category.categoryName)}
              className={`bg-gray-800 rounded-lg p-6 flex flex-col items-center shadow-lg transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${isLocked(category.categoryName) ? 'opacity-90' : ''}`}
            >
              <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gray-700 mb-4 relative">
                {getCategoryIcon(category.categoryName)}
                {isLocked(category.categoryName) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-full">
                    <FaLock className="text-3xl text-yellow-400" />
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold mb-2">{category.categoryName}</h3>
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
                  Start Learning
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

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

export default ProtectedRoute(CategoryPage);