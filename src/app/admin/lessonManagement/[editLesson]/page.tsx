"use client";

import AdminLayout from "@/components/AdminLayout";
import React, { FormEvent, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import AdminProtedctedRoute from "@/HOC/AdminProtectedRoute";
import Select from "react-select";
import { LessonErrors } from "@/utils/Types";
import { editALesson, fetchLesson } from "@/services/lessonApi";
import { fetchLanguages } from "@/services/languageApi";
import { fetchCategories } from "@/services/categoryApi";
import { X } from "lucide-react";
import useAdminAuthStore from "@/store/adminAuthStore";

interface Country {
  _id: string;
  countryName: string;
  isBlocked: boolean;
}

interface Language {
  _id: string;
  languageName: string;
  countries: Country[];
}

interface Category {
  _id: string;
  categoryName: string;
  isBlocked: boolean;
}

interface Lesson {
  title: string;
  description: string;
  content: string;
  languageName: Language;
  categoryName: Category;
  isBlocked: boolean;
}

const EditLessonPage = () => {
  const { token, adminLogout } = useAdminAuthStore();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [errors, setErrors] = useState<LessonErrors>({});
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [hasExistingVideo, setHasExistingVideo] = useState<boolean>(false);

  const router = useRouter();
  const { editLesson } = useParams() as { editLesson: string };

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const data = await fetchLesson(token as string, editLesson);

        setLesson(data);
        setTitle(data.title);
        setDescription(data.description);
        if (data.content) {
          setVideoPreviewUrl(data.content);
          setHasExistingVideo(true);
        }
        setSelectedLanguage({
          value: data.languageName._id,
          label: data.languageName.languageName,
        });
        setSelectedCategory({
          value: data.categoryName._id,
          label: data.categoryName.categoryName,
        });

        // Fetch all languages to display in the dropdown
        const languagesResponse = await fetchLanguages(token as string);
        setLanguages(languagesResponse.languages);

        const categoriesResponse = await fetchCategories(token as string);
        setCategories(categoriesResponse.categories);
      } catch (error) {
        console.log("Error in fetching language details:", error);
        toast.error(
          "An error occurred while fetching lesson details. Please try again."
        );
      }
    };

    fetchLessonData();
  }, [editLesson, token]);

  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !description || !selectedLanguage || !selectedCategory) {
      setErrors({ general: "Required fields must be filled out" });
      return;
    }

    setErrors({});

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("languageName", selectedLanguage?.value || "");
    formData.append("categoryName", selectedCategory?.value || "");

    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      console.log(formData, "data");
      const response = await editALesson(token as string, editLesson, formData);
      if (response.status === 200) {
        toast.success("Lesson edited successfully!");
        router.push("/admin/lessonManagement");
      } else {
        toast.error("Lesson already exists with this title");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Token expired... Login again!");
        adminLogout();
      } else {
        console.error("Error editing lesson:", error);
      }
    }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

  const handleDeleteVideo = () => {
    setSelectedFile(null);
    setHasExistingVideo(false);
    setVideoPreviewUrl(null);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col font-sans">
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-4 w-full mt-5">
            <h1 className="text-3xl text-white">Edit Lesson</h1>
            <div className="ml-auto">
              <button
                className="border border-gray-300 py-1 px-3 rounded-2xl text-white hover:text-black hover:bg-white"
                onClick={() => router.back()}
              >
                Go Back
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center mt-10">
            <div className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-lg">
              <form onSubmit={handleEdit}>
                <h1 className="text-3xl mb-4 text-white text-center">
                  Edit Lesson
                </h1>
                {errors.general && (
                  <p className="text-red-500 text-xs mb-4">{errors.general}</p>
                )}
                <div className="flex mb-4 space-x-4">
                  <input
                    type="text"
                    placeholder="Enter lesson title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 w-1/2"
                  />
                  {errors.title && (
                    <p className="mt-1 text-red-500 text-sm">{errors.title}</p>
                  )}
                  <input
                    type="text"
                    placeholder="Enter lesson description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 w-1/2"
                  />
                  {errors.description && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.description}
                    </p>
                  )}
                </div>
                <div className="flex mb-4 space-x-4">
                  <Select
                    options={languages?.map((language) => ({
                      value: language._id,
                      label:
                        language.languageName.charAt(0).toUpperCase() +
                        language.languageName.slice(1),
                    }))}
                    value={selectedLanguage}
                    onChange={(option) =>
                      setSelectedLanguage(
                        option as { value: string; label: string }
                      )
                    }
                    className="w-1/2 text-black"
                    placeholder="Select Language"
                  />
                  {errors.languageName && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.languageName}
                    </p>
                  )}
                  <Select
                    options={categories?.map((category) => ({
                      value: category._id,
                      label:
                        category.categoryName.charAt(0).toUpperCase() +
                        category.categoryName.slice(1),
                    }))}
                    value={selectedCategory}
                    onChange={(option) =>
                      setSelectedCategory(
                        option as { value: string; label: string }
                      )
                    }
                    className="w-1/2 text-black"
                    placeholder="Select Category"
                  />
                  {errors.categoryName && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.categoryName}
                    </p>
                  )}
                </div>
                {!hasExistingVideo && (
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileInput}
                    className="mb-4 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                  />
                )}
                {errors.content && (
                  <p className="mt-1 text-red-500 text-sm">{errors.content}</p>
                )}
                <div className="flex justify-center">
                  <button
                    className="px-4 py-1 rounded-2xl bg-blue-900 text-white hover:bg-blue-950"
                    type="submit"
                  >
                    Edit
                  </button>
                </div>
              </form>
            </div>
            {videoPreviewUrl && (
              <div className="mb-8 relative">
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-40 h-40 rounded-lg"
                />
                <button
                  onClick={handleDeleteVideo}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
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
    </AdminLayout>
  );
};

export default AdminProtedctedRoute(EditLessonPage);
