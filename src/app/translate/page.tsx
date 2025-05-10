"use client";
import { useEffect, useState } from "react";
import { translateLanguage } from "../../services/lessonApi";
import UserNav from "@/components/UserNav";
import { checkBlock, fetchUser } from "@/services/userApi";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { FaLanguage } from "react-icons/fa";
import useAuthStore from "@/store/authStore";
import { User } from "@/Types/chat";

export default function TranslatePage() {
  const router = useRouter();
  const {logout, isLoading} = useAuthStore()
  const [currenctUser, setCurrenctUser] = useState<User>()
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("hi");

  const languages = [
    { name: "English", code: "en" },
    { name: "Hindi", code: "hi" },
    { name: "Malayalam", code: "ml" },
    { name: "Chinese", code: "zh" },
    { name: "German", code: "de" },
    { name: "Telugu", code: "te" },
    { name: "Urdu", code: "ur" },
    { name: "Kannada", code: "kn" },
  ];

  const handleTranslate = async () => {
    try {
      const response = await translateLanguage(
        text,
        sourceLanguage,
        targetLanguage
      );
      setTranslatedText(response.data.responseData.translatedText);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    const fetchCurrentUser = async () => {
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



  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      <UserNav />

      <div className="flex flex-1 justify-center flex-col items-center p-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center justify-center">
          <FaLanguage className="text-yellow-400 mr-2" />
          Quick Translate
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <textarea
              className="w-full bg-gray-700 p-2 rounded-lg mb-2"
              rows={6}
              placeholder="Enter text to translate"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <select
              className="w-full bg-gray-700 p-2 rounded-lg"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={`source-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <textarea
              className="w-full bg-gray-700 p-2 rounded-lg mb-2"
              rows={6}
              placeholder="Translated text will appear here"
              value={translatedText}
              readOnly
            />
            <select
              className="w-full bg-gray-700 p-2 rounded-lg"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={`target-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleTranslate}
          className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 rounded-full"
        >
          Translate
        </button>
      </div>
    </div>
  );
}
