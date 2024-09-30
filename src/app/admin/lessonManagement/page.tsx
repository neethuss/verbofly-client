"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import AdminProtedctedRoute from "@/HOC/AdminProtectedRoute";
import { fetchLessons, lessonBlockUnblock } from "@/services/lessonApi";
import Modal from "@/components/Modal";

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
}

const page = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchCharacters, setSearchCharacters] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalLessons, setTotalLessons] = useState<number>(0);
  const [limit] = useState<number>(10);
  const [showModal, setShowModal] = React.useState(false);
  const [currentLessonId, setCurrentLessonId] = React.useState<string>("");
  const [currentAction, setCurrentAction] = React.useState<"block" | "unblock">(
    "block"
  );

  const router = useRouter();

  useEffect(() => {
    let token = localStorage.getItem("adminAccessToken");
    const fetchLessonsData = async () => {
      try {
        const data = await fetchLessons(
          token as string,
          searchCharacters,
          page,
          limit
        );
        if (data) {
          setLessons(data.lessons);
          setTotalLessons(data.total);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.error(
            "Token expired or unauthorized. Redirecting to login..."
          );
          localStorage.removeItem("adminAccessToken");
          localStorage.removeItem("admin");
          toast.error("Token expired...Login again!");
          router.push("/admin");
        } else {
          console.error("Error fetching lessons data:", error);
        }
      }
    };
    fetchLessonsData();
  }, [searchCharacters, page, limit]);

  const handleBlockUnblock = async (
    id: string,
    action: "block" | "unblock"
  ) => {
    console.log("update block, unblock");
    const token = localStorage.getItem("adminAccessToken");
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

  return (
    <div className="flex flex-col min-h-screen">
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
                  onChange={(e) => setSearchCharacters(e.target.value)}
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
                      <td className="px-4 py-2 text-white">{lesson.title}</td>
                      <td className="px-4 py-2 text-white">
                        {lesson.description}
                      </td>
                      <td className="px-4 py-2 text-white">{lesson.content}</td>
                      <td className="px-4 py-2 text-white">
                        {lesson.categoryName.categoryName}
                      </td>
                      <td className="px-4 py-2 text-white">
                        {lesson.languageName.languageName}
                      </td>
                      <td className="px-4 py-2 text-white">
                        <div className="flex justify-center">
                          <button
                            className="border rounded-3xl px-7 bg-blue-800 text-white hover:underline ml-2"
                            onClick={() => handleEdit(lesson._id)}
                          >
                            Edit
                          </button>
                          {lesson.isBlocked ? (
                            <button
                              className="border rounded-3xl px-5 bg-green-600 text-white hover:underline ml-2"
                              onClick={() =>
                                handleOpenModal(lesson._id, "unblock")
                              }
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              className="border rounded-3xl px-5 bg-red-600 text-white hover:underline ml-2"
                              onClick={() =>
                                handleOpenModal(lesson._id, "block")
                              }
                            >
                              Block
                            </button>
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

export default AdminProtedctedRoute(page);
