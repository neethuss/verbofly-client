"use client";

import React, { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import AdminProtedctedRoute from "@/HOC/AdminProtectedRoute";
import { fetchLessons, lessonBlockUnblock } from "@/services/lessonApi";
import Modal from "@/components/Modal";
import { CiEdit } from "react-icons/ci";
import { CgUnblock } from "react-icons/cg";
import { MdBlock } from "react-icons/md";
import useAdminAuthStore from "@/store/adminAuthStore";
import LoadingPage from "@/components/Loading";

interface Language {
  _id: string;
  languageName: string;
}

interface Category {
  _id: string;
  categoryName: string;
}

interface Lesson {
  _id: string;
  title: string;
  description: string;
  content: string;
  languageName: Language;
  categoryName: Category;
  isBlocked: boolean;
  createdAt: Date;
}

const LessonManagementPage = () => {
  const { token, adminLogout } = useAdminAuthStore();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchCharacters, setSearchCharacters] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalLessons, setTotalLessons] = useState<number>(0);
  const [limit] = useState<number>(5);
  const [showModal, setShowModal] = React.useState(false);
  const [currentLessonId, setCurrentLessonId] = React.useState<string>("");
  const [currentAction, setCurrentAction] = React.useState<"block" | "unblock">(
    "block"
  );
  const [loadingLessons, setLoadingLessons] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearch(searchCharacters);
      }, 300);
  
      return () => clearTimeout(timer);
    }, [searchCharacters]);
  
    useEffect(() => {
      setPage(1);
    }, [debouncedSearch]);

  
    const fetchLessonsData = useCallback(async () => {
      try {
        setLoadingLessons(true);
        const data = await fetchLessons(
          token as string,
          debouncedSearch,
          page,
          limit
        );
        if (data) {
          const lessons = data.lessons.sort(
            (a: Lesson, b: Lesson) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setLessons(lessons);
          setTotalLessons(data.total);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.error(
            "Token expired or unauthorized. Redirecting to login..."
          );
          toast.error("Token expired...Login again!");
          adminLogout();
        } else {
          console.error("Error fetching lessons data:", error);
        }
      } finally {
        setLoadingLessons(false);
      }
    },[debouncedSearch, page, limit, adminLogout, token])
     
     useEffect(() => {
        fetchLessonsData();
      }, [fetchLessonsData]);

  const handleBlockUnblock = async (
    id: string,
    action: "block" | "unblock"
  ) => {
    console.log("update block, unblock");
    const data = await lessonBlockUnblock(action, id, token as string);
    if (data) {
      setLessons((prevLessons) =>
        prevLessons.map((lesson) =>
          lesson._id === id
            ? { ...lesson, isBlocked: !lesson.isBlocked }
            : lesson
        )
      );
      if (data.isBlocked) {
        toast.success("Lesson is blocked");
      } else {
        toast.success("Lesson is unblocked");
      }
    }
  };

  const handleAddLanguage = () => {
    router.push("/admin/lessonManagement/addLesson");
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/lessonManagement/${id}`);
  };

  const totalPages = Math.ceil(totalLessons / limit);

  const handleOpenModal = (lessonId: string, action: "block" | "unblock") => {
    setCurrentLessonId(lessonId);
    setCurrentAction(action);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleModalConfirm = async () => {
    await handleBlockUnblock(currentLessonId, currentAction);
    setShowModal(false);
  };

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchCharacters(e.target.value);
    };
  
    if (loadingLessons) {
      return (
        <AdminLayout>
          <LoadingPage />
        </AdminLayout>
      );
    }
  

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <AdminLayout>
        <div className="flex flex-col h-full">
          <div className="flex-grow overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 w-full mt-5">
              <h1 className="text-2xl sm:text-3xl text-white mb-4 sm:mb-0">
                Manage Lesson
              </h1>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search lesson by name..."
                  value={searchCharacters}
                  onChange={handleSearchChange}
                  autoFocus={searchCharacters.length > 0}
                  className="px-4 py-2 rounded border-none bg-gray-800 text-white w-full sm:w-auto"
                />

                <button
                  className="bg-white text-blue-950 font-bold px-4 py-2 rounded-2xl w-full sm:w-auto"
                  onClick={handleAddLanguage}
                >
                  Add Lesson
                </button>
              </div>
            </div>

            <div className="overflow-x-auto mt-10">
              <table className="min-w-full bg-gray-800">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-500">
                    <th className="py-2 px-4 text-white">Title</th>
                    <th className="py-2 px-4 text-white">Description</th>
                    <th className="py-2 px-4 text-white">Content</th>
                    <th className="py-2 px-4 text-white">Category</th>
                    <th className="py-2 px-4 text-white">Language</th>
                    <th className="py-2 px-4 text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson) => (
                    <tr
                      key={lesson._id}
                      className="border-b border-gray-500 text-center"
                    >
                      <td className="px-4 py-2 text-white">
                        {lesson.title.charAt(0).toUpperCase() +
                          lesson.title.slice(1)}
                      </td>
                      <td className="px-4 py-2 text-white">
                        {lesson.description}
                      </td>
                      <td className="px-4 py-2 text-white">{lesson.content}</td>
                      <td className="px-4 py-2 text-white">
                        {lesson.categoryName.categoryName
                          .charAt(0)
                          .toUpperCase() +
                          lesson.categoryName.categoryName.slice(1)}
                      </td>
                      <td className="px-4 py-2 text-white">
                        {lesson.languageName.languageName
                          .charAt(0)
                          .toUpperCase() +
                          lesson.languageName.languageName.slice(1)}
                      </td>
                      <td className="px-4 py-2 text-white">
                        <div className="flex justify-center gap-3">
                          <CiEdit
                            className=" text-blue-800 cursor-pointer"
                            onClick={() => handleEdit(lesson._id)}
                          />

                          {lesson.isBlocked ? (
                            <CgUnblock
                              className=" text-green-600 cursor-pointer"
                              onClick={() =>
                                handleOpenModal(lesson._id, "unblock")
                              }
                            />
                          ) : (
                            <MdBlock
                              className=" text-red-600 cursor-pointer"
                              onClick={() =>
                                handleOpenModal(lesson._id, "block")
                              }
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-auto py-4">
            <div className="flex justify-center items-center space-x-4">
              <button
                className="px-4 py-1 border border-gray-300 text-white rounded disabled:opacity-50"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-white">
                Page {page} of {totalPages}
              </span>
              <button
                className="px-4 py-1 border border-gray-300 text-white rounded disabled:opacity-50"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {showModal && (
          <Modal
            onClose={handleCloseModal}
            title={`Are you sure you want to ${currentAction}?`}
          >
            <div className="flex justify-between">
              <button
                onClick={handleModalConfirm}
                className="bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={handleCloseModal}
                className="bg-red-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-red-700 transition-colors"
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
      </AdminLayout>
    </div>
  );
};

export default AdminProtedctedRoute(LessonManagementPage);
