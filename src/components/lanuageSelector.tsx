"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaLanguage } from "react-icons/fa";
import { GiProgression } from "react-icons/gi";
import { ImProfile } from "react-icons/im";
import { CiSquareQuestion } from "react-icons/ci";
import { IoMdLogOut } from "react-icons/io";
import { MdPayment } from "react-icons/md";
import useAuthStore from "@/store/authStore";
import ProtectedRoute from "@/HOC/ProtectedRoute";
import LoadingPage from "@/components/Loading";
import Modal from "@/components/Modal";
import { fetchLanguages } from "@/services/languageApi";
import { fetchUser } from "@/services/userApi";
import Trynew from "../../public/asset/Trynew.png";
import UserNav from "./UserNav";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

interface Country {
  _id: string;
  countryName: string;
  isBlocked: boolean;
}

interface Language {
  _id: string;
  languageName: string;
  countries: Country[];
  isBlocked: boolean;
}

const Lesson: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedlanguage] = useState<Language | null>(
    null
  );
  const { isAuthenticated, setUser, logout, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    const user = localStorage.getItem("user");
    setUser(user);

    const fetchData = async () => {
      try {
        const languagesData = await fetchLanguages(token as string);
        setLanguages(languagesData.languages || []);
        const userData = await fetchUser(token as string);
        setUser(userData);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status === 403) {
            toast.error("User is blocked");
            logout();
          }
        }
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [isAuthenticated, setUser, logout]);

  const handleOpenModal = (language: Language) => {
    setSelectedlanguage(language);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setSelectedlanguage(null);
    setShowModal(false);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
      {languages.map((language) => (
        <div key={language._id} className="bg-gray-800 rounded-lg p-6 flex flex-col items-center shadow-lg transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
          <FaLanguage className="text-yellow-400 text-4xl mb-4" />
          <h2 className="text-2xl font-bold mb-2">{language.languageName}</h2>
          <p
            className="text-center mb-4 hover:underline decoration-yellow-400 cursor-pointer"
            onClick={() => handleOpenModal(language)}
          >
            Spoken in {language.countries.length}{" "}
            {language.countries.length === 1 ? "country" : "countries"}
          </p>
          <Link href={`/lesson/${language._id}`} key={language._id}>
            <button className="mt-auto bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 rounded-full">
              Start Learning
            </button>
          </Link>
        </div>
      ))}

      {showModal && selectedLanguage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {selectedLanguage.languageName.charAt(0).toUpperCase() + selectedLanguage.languageName.slice(1)} is spoken in countries include:
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="mt-4 max-h-60 overflow-y-auto text-white">
              <ul className="list-disc list-inside">
                {selectedLanguage.countries.map((country) => (
                  <li key={country._id} className="mb-2">
                    {country.countryName.charAt(0).toUpperCase()+country.countryName.slice(1)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

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

const ActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <div className="flex flex-col items-center">
    <button
      onClick={onClick}
      className="bg-gray-700 p-3 rounded-full hover:bg-yellow-400 transition duration-300"
    >
      {icon}
    </button>
    <span className="text-white text-xs mt-1">{label}</span>
  </div>
);

export default ProtectedRoute(Lesson);
