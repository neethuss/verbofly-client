"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaPlayCircle, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import { fetchLesson } from "@/services/lessonApi";
import { fetchUser, getUserProgress, updateProgress } from "@/services/userApi";
import ProtectedRoute from "@/HOC/ProtectedRoute";
import UserNav from "@/components/UserNav";
import useAuthStore from "@/store/authStore";
import { User } from "@/Types/chat";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  content: string;
  languageName: { _id: string };
}

const VideoLessonPage = () => {
  const { logout } = useAuthStore();
  const [currentUser, setCurrentUser] = useState<User>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const { lessonId } = useParams();
  const router = useRouter();

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
    const fetchLessonData = async () => {
      const token = localStorage.getItem("userAccessToken");
      try {
        const data = await fetchLesson(token as string, lessonId as string);
        setLesson(data);
        const progressData = await getUserProgress(token as string);
        console.log(progressData, "progress data");
        const isLessonCompleted = progressData.data.languages.some(
          (lang: any) =>
            lang.lessons.some(
              (les: any) =>
                les.lesson &&
                les.lesson._id &&
                les.lesson._id === lessonId &&
                les.isCompleted
            )
        );
        setIsCompleted(isLessonCompleted);
      } catch (error:any) {
        if (error.response?.status === 403) {
          toast.error("Subscription required to access this quiz.");
          router.push("/subscription");
        }
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 401) {
            localStorage.removeItem("userAccessToken");
            localStorage.removeItem("user");
            toast.error("Session expired. Please log in again.");
            router.push("/login");
          } else if (status === 403) {
            toast.error("Subscription required to access this quiz.");
            router.push("/subscription");
          } else if (status === 404) {
            console.log("no progress until now");
          } else {
            console.error("Error fetching lesson data:", error);
            toast.error("An error occurred. Please try again later.");
          }
        }
      }
    };

    fetchLessonData();
  }, [lessonId, router]);

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("userAccessToken");
      const data = await fetchUser(token as string);
      const userId = data._id;
      const languageId = lesson?.languageName._id;

      await updateProgress(
        token as string,
        userId,
        languageId as string,
        lessonId as string,
        true
      );

      setIsCompleted(true);
      toast.success("Lesson completed successfully!");
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error(
        "An error occurred while updating progress. Please try again later."
      );
    }
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      <UserNav />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 md:ml-28 lg:ml-24">
        <div className="max-w-4xl w-full flex flex-col space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">
            <span className="text-yellow-400">
              {lesson.title.charAt(0).toUpperCase() + lesson.title.slice(1)}
            </span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base text-center">
            {lesson.description}
          </p>

          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden aspect-w-16 aspect-h-9">
            <video
              className="w-full h-full object-contain"
              controls
              src={lesson.content}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => router.back()}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 flex items-center text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <FaArrowLeft className="mr-2" /> Back to Lessons
            </button>

            <button
              onClick={handleComplete}
              disabled={isCompleted}
              className={`${
                isCompleted
                  ? "bg-green-600 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-500 text-black"
              } font-bold py-2 px-4 rounded-full transition duration-300 flex items-center text-sm sm:text-base w-full sm:w-auto justify-center`}
            >
              {isCompleted ? (
                <>
                  <FaCheckCircle className="mr-2" /> Completed
                </>
              ) : (
                <>
                  <FaPlayCircle className="mr-2" /> Complete Lesson
                </>
              )}
            </button>
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

export default ProtectedRoute(VideoLessonPage);
