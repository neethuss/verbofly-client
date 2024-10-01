"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { checkBlock, fetchUser, getUserProgress } from "../../services/userApi";
import { fetchLanguages } from "../../services/languageApi";
import { ToastContainer, toast } from "react-toastify";
import { fetchLessonsOnLanguage } from "../../services/lessonApi";
import axios from "axios";
import Head from "next/head";
import {
  FaGlobe,
  FaFire,
  FaBook,
  FaRocket,
  FaSkullCrossbones,
} from "react-icons/fa";
import ProtectedRoute from "@/HOC/ProtectedRoute";
import useAuthStore from "@/store/authStore";
import UserNav from "@/components/UserNav";
import { MdOutlineQuiz } from "react-icons/md";
import { ImTrophy } from "react-icons/im";

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
  profilePhoto: string;
  country: Country;
  nativeLanguage: Language;
  knownLanguages: Language[];
  languagesToLearn: Language[];
  bio: string;
  connections: User[];
}

interface Lesson {
  _id: string;
  title: string;
  description: string;
  content: string;
  languageName: { _id: string };
}

const ProgressPage: React.FC = () => {
  const [user, setCurrentUser] = useState<User | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [newLessons, setNewLessons] = useState<Lesson[]>([]);
  const [progressLessons, setProgressLessons] = useState<Lesson[]>([]);
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [streak, setStreak] = useState<number>(0);
  const [quizAttempted, setQuizAttempted] = useState<number>(0);
  const [quizFailed, setQuizFailed] = useState<number>(0);
  const [quizWin, setQuizWin] = useState<number>(0);

  const { setUser ,logout} = useAuthStore();
  const router = useRouter();
  
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
        const userData = await fetchUser(token);
        setCurrentUser(userData);
        const languageData = await fetchLanguages(token);
        setLanguages(languageData.languages);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            if (error.response.status === 403) {
              toast.error("User is blocked");
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

    fetchData();
  }, [router, setUser]);

  const handleLanguageChange = useCallback(
    async (languageId: string) => {
      const token = localStorage.getItem("userAccessToken");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const allLessons = await fetchLessonsOnLanguage(token, languageId);

        if (allLessons.length === 0) {
          setProgressLessons([]);
          setNewLessons([]);
          setStreak(0);
          return;
        }

        const response = await getUserProgress(token);
        if (response.data) {
          const languageProgress = response.data.languages.find(
            (lang: any) => lang.language._id === languageId
          );
          setQuizAttempted(languageProgress.quizAttempted);
          setQuizFailed(languageProgress.quizFailed);
          setQuizWin(languageProgress.quizWin);

          if (languageProgress) {
            const progressLessons = languageProgress.lessons.map(
              (lesson: any) => lesson.lesson
            );
            setProgressLessons(progressLessons);
            const inProgressLessonIds = progressLessons.map(
              (lesson: any) => lesson._id
            );
            const newLessons = allLessons.filter(
              (lesson: any) => !inProgressLessonIds.includes(lesson._id)
            );
            setNewLessons(newLessons);
            setStreak(languageProgress.streak);
          } else {
            setProgressLessons([]);
            setNewLessons(allLessons);
            setStreak(0);
          }
        } else {
          setProgressLessons([]);
          setNewLessons(allLessons);
          setStreak(0);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.log("No lessons found for this language.");
          setProgressLessons([]);
          setNewLessons([]);
          setStreak(0);
        } else {
          console.error("Error:", error);
        }
      }
    },
    [router]
  );

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      <Head>
        <title>VerboFly - Language Progress</title>
        <meta
          name="description"
          content="Track your progress in multiple languages with VerboFly"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <UserNav />

      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 md:ml-28 lg:ml-24 overflow-y-auto">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-yellow-400">
            Your Language Learning Progress
          </h1>

          <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 w-full">
            <select
              className="w-full p-2 text-base bg-gray-700 text-white border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
              value={targetLanguage}
              onChange={(e) => {
                setTargetLanguage(e.target.value);
                handleLanguageChange(e.target.value);
              }}
            >
              <option value="">Choose a language</option>
              {languages.map((language) => (
                <option key={language._id} value={language._id}>
                  {language.languageName}
                </option>
              ))}
            </select>
          </div>

          {targetLanguage && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                <div className="flex items-center mb-2">
                  <FaBook className="text-2xl sm:text-3xl text-yellow-400" />
                  <h3 className="text-base sm:text-lg font-semibold ml-2 text-white">
                    Lessons Completed
                  </h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-400">
                  {progressLessons.length} /{""}
                  {progressLessons.length + newLessons.length}
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                <div className="flex items-center mb-2">
                  <FaFire className="text-2xl sm:text-3xl text-yellow-400" />
                  <h3 className="text-base sm:text-lg font-semibold ml-2 text-white">
                    Day Streak
                  </h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-400">
                  {streak || 0} days
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                <div className="flex items-center mb-2">
                  <FaRocket className="text-2xl sm:text-3xl text-yellow-400" />
                  <h3 className="text-base sm:text-lg font-semibold ml-2 text-white">
                    Overall Progress
                  </h3>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-gray-700">
                    <div
                      style={{
                        width: `${
                          (progressLessons.length /
                            (progressLessons.length + newLessons.length)) *
                          100
                        }%`,
                      }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-400"
                    ></div>
                  </div>
                  {progressLessons.length > 0 && (
                    <p className="text-sm text-white font-semibold">
                      {Math.round(
                        (progressLessons.length /
                          (progressLessons.length + newLessons.length)) *
                          100
                      )}
                      % Complete
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {targetLanguage && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                <div className="flex items-center mb-2">
                  <MdOutlineQuiz className="text-2xl sm:text-3xl text-yellow-400" />
                  <h3 className="text-base sm:text-lg font-semibold ml-2 text-white">
                    Quiz Attempted
                  </h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-400">
                  {quizAttempted}
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                <div className="flex items-center mb-2">
                  <ImTrophy className="text-2xl sm:text-3xl text-yellow-400" />
                  <h3 className="text-base sm:text-lg font-semibold ml-2 text-white">
                    Quiz Win
                  </h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-400">
                  {quizWin}
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                <div className="flex items-center mb-2">
                  <FaSkullCrossbones className="text-2xl sm:text-3xl text-yellow-400" />
                  <h3 className="text-base sm:text-lg font-semibold ml-2 text-white">
                    Quiz Failed
                  </h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-400">
                  {quizFailed}
                </p>
              </div>
            </div>
          )}

          {targetLanguage && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center text-yellow-400">
                  <FaBook className="mr-2" /> Lessons in Progress
                </h2>
                {progressLessons.length > 0 ? (
                  <div className="space-y-4">
                    {progressLessons.map((lesson: any) => (
                      <div
                        key={lesson?._id}
                        className="p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                      >
                        <h3 className="text-lg font-semibold text-white">
                          {lesson?.title}
                        </h3>
                        <p className="text-sm text-gray-300 mb-2">
                          {lesson?.description}
                        </p>
                        <div className="mt-2 bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${lesson?.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-yellow-400">
                          {lesson?.progress}% Completed
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300">
                    No lessons in progress for the selected language.
                  </p>
                )}
              </section>

              <section className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center text-yellow-400">
                  <FaRocket className="mr-2" /> Available Lessons
                </h2>
                {newLessons.length > 0 ? (
                  <div className="space-y-4">
                    {newLessons.map((lesson: any) => (
                      <div
                        key={lesson._id}
                        className="p-3 bg-gray-700 border border-gray-600 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg cursor-pointer"
                      >
                        <h3 className="text-lg font-semibold text-white">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-300 mb-2">
                          {lesson.description}
                        </p>
                        <button className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-1 px-3 rounded text-sm transition-all duration-300">
                          Start Lesson
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300">
                    No new lessons available for the selected language.
                  </p>
                )}
              </section>
            </div>
          )}
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

export default ProtectedRoute(ProgressPage);
