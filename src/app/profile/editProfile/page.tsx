"use client"
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Select, { useStateManager } from "react-select";
import {
  FaTachometerAlt,
  FaBook,
  FaUsers,
  FaUser,
  FaSignOutAlt,
  FaCamera,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import ProtectedRoute from "@/HOC/ProtectedRoute";
import useAuthStore from "@/store/authStore";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { fetchCountries } from "@/services/countryApi";
import { fetchLanguages } from "@/services/languageApi";
import { checkBlock, fetchUser, updateProfileImage, updateUser } from "@/services/userApi";
import UserNav from "@/components/UserNav";
import Modal from "@/components/Modal";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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

interface User {
  username?: string;
  email?: string;
  phone?: string;
  country?: Country;
  nativeLanguage?: Language;
  knownLanguages?: Language[];
  languagesToLearn?: Language[];
  bio?: string;
  profilePhoto?: string;
  coverPhoto?: string;
}

const EditProfile: React.FC = () => {
  const [user, setCurrentUser] = useState<User | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null); 
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<{value: string;label: string;} | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedNativeLanguage, setSelectedNativeLanguage] = useState<{value: string;label: string;} | null>(null);
  const [selectedKnownLanguages, setSelectedKnownLanguages] = useState<{ value: string; label: string }[]>([]);
  const [selectedLanguagesToLearn, setSelectedLanguagesToLearn] = useState<{ value: string; label: string }[]>([]);
  const [showModal, setShowModal] = useState(false)

  const router = useRouter();
  const { logout } = useAuthStore();

  

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCurrentUser(response.data);
        setProfileImagePreview(
          response.data.profilePhoto ? response.data.profilePhoto : null
        );

        setSelectedNativeLanguage(
          response.data.nativeLanguage
            ? {
                value: response.data.nativeLanguage._id,
                label: response.data.nativeLanguage.languageName,
              }
            : null
        );
        setSelectedCountry(
          response.data.country
            ? {
                value: response.data.country._id,
                label: response.data.country.countryName,
              }
            : null
        );
        setSelectedKnownLanguages(
          response.data.knownLanguages
            ? response.data.knownLanguages.map((language: Language) => ({
                value: language._id,
                label: language.languageName,
              }))
            : []
        );

        setSelectedLanguagesToLearn(
          response.data.languagesToLearn
            ? response.data.languagesToLearn.map((language: Language) => ({
                value: language._id,
                label: language.languageName,
              }))
            : []
        );
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

    const fetchCountriesData = async () => {
      try {
        const data = await fetchCountries(token as string);
        const countries = data.countries.filter((country:Country)=>!country.isBlocked)
        setCountries(countries || []);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };

    const fetchLanguagesData = async () => {
      try {
        const data = await fetchLanguages(token as string);
        const languages  = data.languages.filter((language:Language)=> !language.isBlocked)
        setLanguages(languages || []);
      } catch (error) {
        console.error("Failed to fetch languages:", error);
      }
    };

    fetchUser();
    fetchCountriesData();
    fetchLanguagesData();
  }, [router, logout]);

  const handleSave = async () => {
    const token = localStorage.getItem('userAccessToken');
    try {
      let profilePhotoUrl = user?.profilePhoto;

      if (profileImageFile) {
        profilePhotoUrl = await updateProfileImage(token as string, profileImageFile);
        console.log("Uploaded profile image URL:", profilePhotoUrl);
      }

      const updatedUser = { ...user, profilePhoto: profilePhotoUrl };
      console.log("User data before save:", updatedUser);

      const data = await updateUser(token as string, updatedUser);
      toast.success("Profile updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };
  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleKnownLanguagesChange = (selectedOptions: any) => {
    setSelectedKnownLanguages(selectedOptions);
    setCurrentUser((prevUser) => ({
      ...prevUser,
      knownLanguages: selectedOptions.map((option: any) =>
        languages.find((language) => language._id === option.value)
      ),
    }));
  };

  const handleLanguagesToLearn = (selectedOptions: any) => {
    setSelectedLanguagesToLearn(selectedOptions);
    setCurrentUser((prevUser) => ({
      ...prevUser,
      languagesToLearn: selectedOptions.map((option: any) =>
        languages.find((language) => language._id === option.value)
      ),
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = () => setShowModal(true)
  const handleCloseModal = () => setShowModal(false)
  

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white font-sans">
    <UserNav />

    <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
        <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center">Edit Your Profile</h1>

        <div className="bg-gray-800 rounded-lg p-4 md:p-8 shadow-lg flex-grow flex flex-col">
          <div className="flex flex-col sm:flex-row items-center mb-6">
            <div className="flex-shrink-0 mb-4 sm:mb-0">
              {profileImagePreview ? (
                <Image
                  src={profileImagePreview}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-700" />
              )}
            </div>
            <div className="sm:ml-6 flex-grow">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-300 border border-gray-600 rounded-md bg-gray-700 p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-y-auto">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={user?.username || ""}
                onChange={handleChange}
                className="mt-1 block w-full text-sm text-white border border-gray-600 rounded-md bg-gray-700 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Country
              </label>
              <Select
                options={countries.map((country) => ({
                  value: country._id,
                  label: country.countryName,
                }))}
                value={selectedCountry}
                onChange={(selectedOption) => {
                  setSelectedCountry(selectedOption);
                  setCurrentUser((prevUser) => ({
                    ...prevUser,
                    country: countries.find(
                      (country) => country._id === selectedOption?.value
                    ),
                  }));
                }}
                className="mt-1 block w-full text-gray-900"
                placeholder="Select your country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Native Language
              </label>
              <Select
                options={languages.map((lang) => ({
                  value: lang._id,
                  label: lang.languageName,
                }))}
                value={selectedNativeLanguage}
                onChange={(selectedOption) => {
                  setSelectedNativeLanguage(selectedOption);
                  setCurrentUser((prevUser) => ({
                    ...prevUser,
                    nativeLanguage: languages.find(
                      (language) => language._id === selectedOption?.value
                    ),
                  }));
                }}
                className="mt-1 block w-full text-gray-900"
                placeholder="Select your native language"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Known Languages
              </label>
              <Select
                options={languages.map((language) => ({
                  value: language._id,
                  label: language.languageName,
                }))}
                isMulti
                value={selectedKnownLanguages}
                onChange={handleKnownLanguagesChange}
                className="mt-1 block w-full text-gray-900"
                placeholder="Select known languages"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Languages to Learn
              </label>
              <Select
                options={languages.map((language) => ({
                  value: language._id,
                  label: language.languageName,
                }))}
                isMulti
                value={selectedLanguagesToLearn}
                onChange={handleLanguagesToLearn}
                className="mt-1 block w-full text-gray-900"
                placeholder="Select languages to learn"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={user?.bio || ""}
                onChange={handleChange}
                className="mt-1 block w-full p-2 text-sm text-white border border-gray-600 rounded-md bg-gray-700"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleOpenModal}
              className="flex items-center justify-center px-4 py-2 bg-yellow-400 text-black rounded-full hover:bg-yellow-500 transition duration-300 w-full sm:w-auto"
            >
              <FaSave className="mr-2" /> Save Changes
            </button>
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition duration-300 w-full sm:w-auto"
            >
              <FaTimes className="mr-2" /> Cancel
            </button>
          </div>
        </div>
      </div>
    </main>

    {showModal && (
      <Modal
        onClose={handleCloseModal}
        title="Are you sure you want to save changes?"
      >
        <div className="flex flex-col sm:flex-row justify-between mt-4 space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleSave}
            className="bg-yellow-400 hover:bg-yellow-500 text-black p-2 rounded-full transition duration-300 w-full sm:w-auto"
          >
            Yes, Save Changes
          </button>
          <button
            onClick={handleCloseModal}
            className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full transition duration-300 w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </Modal>
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

export default ProtectedRoute(EditProfile);
