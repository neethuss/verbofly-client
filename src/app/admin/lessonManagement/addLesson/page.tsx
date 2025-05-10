"use client";

import React, { FormEvent, useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import axios from "axios";
import Select from "react-select";
import { lessonSchema } from "@/utils/Validation";
import { LessonErrors } from "@/utils/Types";
import AdminProtedctedRoute from "@/HOC/AdminProtectedRoute";
import { fetchLanguages } from "@/services/languageApi";
import { fetchCategories } from "@/services/categoryApi";
import { addLesson } from "@/services/lessonApi";
import { X } from "lucide-react";
import useAdminAuthStore from "@/store/adminAuthStore";
import LoadingPage from "@/components/Loading";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Language {
  _id: string;
  languageName: string;
  isBlocked: boolean;
}

interface Category {
  _id: string;
  categoryName: string;
  isBlocked: boolean;
}

const AddLessonPage = () => {
  const {token, adminLogout} = useAdminAuthStore()
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [category, setCategory] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<LessonErrors>({});
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [loadingAddLesson, setLoadingAddLesson] = useState<boolean>(false)

  const router = useRouter();

  useEffect(() => {
    const fetchLanguagesData = async () => {
      try {
        const data = await fetchLanguages(token as string);
        const languages = data.languages.filter(
          (language: Language) => !language.isBlocked
        );
        console.log(languages, "langes");
        setLanguages(languages);
      } catch (error) {
        console.log("Error fetching languages in add lesson page");
      }
    };

    const fetchCategoriesData = async () => {
      try {
        const data = await fetchCategories(token as string);
        const categories = data.categories.filter(
          (category: Category) => !category.isBlocked
        );
        console.log(categories, "categ");
        setCategories(categories);
      } catch (error) {
        console.log("Error fetching categories in add lesson page");
      }
    };

    fetchLanguagesData();
    fetchCategoriesData();
  }, [token]);

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
    setVideoPreviewUrl(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !description || !selectedFile || !language || !category) {
      setErrors({ general: "All fields must be filled out" });
      return;
    }
    setErrors({});

    const validationResult = lessonSchema.safeParse({
      title,
      description,
      content: selectedFile,
      languageName: language?.value || "",
      categoryName: category?.value || "",
    });

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.format();
      setErrors({
        title: fieldErrors.title?._errors[0],
        description: fieldErrors.description?._errors[0],
        content: fieldErrors.content?._errors[0],
        languageName: fieldErrors.languageName?._errors[0],
        categoryName: fieldErrors.categoryName?._errors[0],
      });
      return;
    } else {
      setErrors({});
    }

    if (!selectedFile) {
      toast.error("Please select a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", selectedFile);
    formData.append("languageName", language?.value || "");
    formData.append("categoryName", category?.value || "");

    try {
      setLoadingAddLesson(true)
      const response = await addLesson(token as string, formData);
      console.log(response,'res')
      if (response.status === 201) {
        toast.success("Lesson added successfully!");
        router.push("/admin/lessonManagement");
      } else {
        toast.error("Lesson already exist with this title");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Token expired...Login again!");
        adminLogout()
      } else {
        console.error("Error adding lesson:", error);
      }
    }finally{
      setLoadingAddLesson(false)
    }
  };

  if(loadingAddLesson){
    return <LoadingPage/>
  }

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col font-sans">
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-4 w-full mt-5">
            <h1 className="text-3xl text-white">Add Lesson</h1>
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
              <form onSubmit={handleSubmit}>
                <h1 className="text-3xl mb-4 text-white text-center">
                  Add Lesson
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
                    options={languages.map((language) => ({
                      value: language._id,
                      label:
                        language.languageName.charAt(0).toUpperCase() +
                        language.languageName.slice(1),
                    }))}
                    className="w-1/2 text-black"
                    onChange={(selectedOption) => setLanguage(selectedOption)}
                    placeholder="Select Language"
                  />
                  {errors.languageName && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.languageName}
                    </p>
                  )}
                  <Select
                    options={categories.map((category) => ({
                      value: category._id,
                      label:
                        category.categoryName.charAt(0).toUpperCase() +
                        category.categoryName.slice(1),
                    }))}
                    className="w-1/2 text-black"
                    onChange={(selectedOption) => setCategory(selectedOption)}
                    placeholder="Select Category"
                  />
                  {errors.categoryName && (
                    <p className="mt-1 text-red-500 text-sm">
                      {errors.categoryName}
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileInput}
                  className="mb-4 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                />
                {errors.content && (
                  <p className="mt-1 text-red-500 text-sm">{errors.content}</p>
                )}
                <div className="flex justify-center">
                  <button
                    className="px-4 py-1 rounded-2xl bg-blue-900 text-white hover:bg-blue-950"
                    type="submit"
                  >
                    Add
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

export default AdminProtedctedRoute(AddLessonPage);
