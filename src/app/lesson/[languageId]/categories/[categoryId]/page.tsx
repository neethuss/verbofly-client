"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPlay, FaBookOpen, FaCheck } from "react-icons/fa";
import { fetchLessonsInCategoryInLanguage } from "@/services/lessonApi";
import { fetchUser, getUserProgress } from "@/services/userApi";
import ProtectedRoute from "@/HOC/ProtectedRoute";
import UserNav from "@/components/UserNav";
import useAuthStore from "@/store/authStore";
import { User } from "@/Types/chat";
import LoadingPage from "@/components/Loading";

interface Category {
  id: string;
  categoryName: string;
}

interface Language {
  id: string;
  languageName: string;
}

interface Lesson {
  _id: string;
  title: string;
  description: string;
  content: string;
  languageName: Language;
  categoryName: Category;
  isBlocked: boolean;
}

const LessonListPage = () => {
  const { logout } = useAuthStore();
  const [currentUser, setCurrentUser] = useState<User>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isCompleted, setIsCompleted] = useState<Record<string, boolean>>({});
  const [categoryName, setCategoryName] = useState<string>("");
  const { languageId, categoryId } = useParams();
  const router = useRouter();
  const [loadingLessons, setLoadingLessons] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    const fetchCurrentUser = async () => {
      try {
        const data = await fetchUser(token as string);
        setCurrentUser(data);
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
    const fetchData = async () => {
      const token = localStorage.getItem("userAccessToken");
      try {
        setLoadingLessons(true);
        const data = await fetchLessonsInCategoryInLanguage(
          token as string,
          languageId as string,
          categoryId as string
        );
        const lessons = data.filter((lesson: Lesson) => !lesson.isBlocked);
        setLessons(lessons);
        if (data.length > 0) {
          setCategoryName(data[0].categoryName.categoryName);
        }
      } catch (error: any) {
        if (error.response?.status === 403) {
          toast.error("Subscription required to access this lesson.");
          router.push("/subscription");
        }
        if (axios.isAxiosError(error)) {
          if (error.response) {
            if (error.response.status === 401) {
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
        setLoadingLessons(false);
      }
    };

    const fetchUserProgressData = async () => {
      try {
        const token = localStorage.getItem("userAccessToken");
        const response = await getUserProgress(token as string);
        console.log(response, "getUserProgress");
        const progressMap: Record<string, boolean> = {};
        const languages = response.data.languages || [];
        languages.forEach(
          (lang: {
            lessons: { lesson: { _id: string } | null; isCompleted: boolean }[];
          }) => {
            lang.lessons.forEach(
              (lesson: {
                lesson: { _id: string } | null;
                isCompleted: boolean;
              }) => {
                if (lesson.lesson && lesson.lesson._id) {
                  progressMap[lesson.lesson._id] = lesson.isCompleted;
                }
              }
            );
          }
        );
        setIsCompleted(progressMap);
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

    fetchData();
    fetchUserProgressData();
  }, [languageId, categoryId, router, logout]);

  const openVideoLesson = (lessonId: string) => {
    router.push(`/lesson/${languageId}/categories/${categoryId}/${lessonId}`);
  };

  if (loadingLessons) {
    return <LoadingPage />;
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      <UserNav />

      <main className="flex-1 p-4 sm:p-6 md:p-8 md:ml-28 lg:ml-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-center">
            <span className="text-yellow-400">{categoryName}</span> Lessons
          </h1>
          <p className="text-lg sm:text-xl text-center mb-8 sm:mb-12 max-w-3xl mx-auto">
            Explore our video lessons and enhance your language skills
          </p>

          <div
            className={`flex flex-wrap justify-center gap-6 sm:gap-8 ${
              lessons.length > 2 ? "sm:justify-start" : ""
            }`}
          >
            {lessons.map((lesson) => (
              <div
                key={lesson._id}
                className="bg-gray-800 rounded-lg p-4 sm:p-6 flex flex-col shadow-lg transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)]"
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  <FaBookOpen className="text-yellow-400 text-xl sm:text-2xl mr-2" />
                  <h3 className="text-lg sm:text-xl font-semibold">
                    {lesson.title.charAt(0).toUpperCase() +
                      lesson.title.slice(1)}
                  </h3>
                </div>
                <p className="text-gray-300 mb-4 flex-grow text-sm sm:text-base">
                  {lesson.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs sm:text-sm text-yellow-400 flex items-center">
                    {isCompleted[lesson._id] ? (
                      <>
                        <FaCheck className="mr-1" /> Completed
                      </>
                    ) : (
                      "Not Completed"
                    )}
                  </span>
                  <button
                    onClick={() => openVideoLesson(lesson._id)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-1 px-3 sm:py-2 sm:px-4 rounded-full transition-colors duration-300 flex items-center text-sm sm:text-base"
                  >
                    <FaPlay className="mr-1 sm:mr-2" /> Play
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProtectedRoute(LessonListPage);
