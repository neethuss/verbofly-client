"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import AdminProtedctedRoute from "@/HOC/AdminProtectedRoute";
import { fetchLessons, lessonBlockUnblock } from "@/services/lessonApi";
import Modal from "@/components/Modal";
import { fetchQuizzes } from "@/services/quizApi";
import useAdminAuthStore from "@/store/adminAuthStore";

interface IQuizOtpion {
  option: string;
}

interface IQuizQuestion {
  question: string;
  options: IQuizOtpion[];
  correctAnswer: string;
}

interface Language {
  _id: string;
  languageName: string;
}

interface Category {
  _id: string;
  categoryName: string;
}

interface IQuiz {
  _id: string;
  name: string;
  languageName: Language;
  categoryName: Category;
  questions: IQuizQuestion[];
}

const QuizManagementPage = () => {
  const {token, adminLogout} = useAdminAuthStore()
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);
  const [searchCharacters, setSearchCharacters] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalQuizzes, setTotalQuizzes] = useState<number>(0);
  const [limit] = useState<number>(10);
  const [selectedQuiz, setSelectedQuiz] = useState<IQuiz | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchQuizzesdata = async () => {
      try {
        const data = await fetchQuizzes(
          token as string,
          searchCharacters,
          page,
          limit
        );
        if (data) {
          setQuizzes(data.quizzes);
          setTotalQuizzes(data.total);
        }
        console.log(data, "quizzes");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.error("Token expired...Login again!");
          adminLogout()
        } else {
          console.error("Error fetching lessons data:", error);
        }
      }
    };
    fetchQuizzesdata();
  }, [searchCharacters, page, limit, adminLogout, token]);

  const handleAddQuiz = () => {
    router.push("/admin/quizManagement/addQuiz");
  };
  const totalPages = Math.ceil(totalQuizzes / limit);

  const handleViewQuestions = (quiz: IQuiz) => {
    setSelectedQuiz(quiz);
  };

  const handleCloseModal = () => {
    setSelectedQuiz(null);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <AdminLayout>
        <div className="flex flex-col h-full">
          <div className="flex-grow overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 w-full mt-5">
              <h1 className="text-3xl text-white mb-4 sm:mb-0">Manage Quiz</h1>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                {/* <input
                type="text"
                placeholder="Search language..."
                value={searchCharacters}
                onChange={(e) => setSearchCharacters(e.target.value)}
                className="px-4 py-2 rounded border-none bg-gray-800 text-white w-full sm:w-auto"
              /> */}

                <button
                  className="bg-white text-blue-950 font-bold px-4 py-2 rounded-2xl w-full sm:w-auto"
                  onClick={handleAddQuiz}
                >
                  Add Quiz
                </button>
              </div>
            </div>
            <div className="overflow-x-auto mt-10">
              <table className="min-w-full bg-gray-800">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-500">
                    <th className="py-2 px-4 text-white">Name</th>
                    <th className="py-2 px-4 text-white">Language</th>
                    <th className="py-2 px-4 text-white">Category</th>
                    <th className="py-2 px-4 text-white">More</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz) => (
                    <tr
                      key={quiz._id}
                      className="border-b border-gray-500 text-center"
                    >
                      <td className="px-4 py-2 text-white"> {quiz.name}</td>
                      <td className="px-4 py-2 text-white">
                        {quiz.languageName.languageName}
                      </td>
                      <td className="px-4 py-2 text-white">
                        {quiz.categoryName.categoryName}
                      </td>
                      <td
                        className="px-4 py-2 text-white underline cursor-pointer hover:text-yellow-400"
                        onClick={() => handleViewQuestions(quiz)}
                      >
                        view questions...
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

          {selectedQuiz && (
            <Modal
              title={`${selectedQuiz.name} - Questions`}
              onClose={() => handleCloseModal()}
            >
              {selectedQuiz && (
                <div className="max-h-[70vh] overflow-y-auto pr-4">
                  {/* <h2 className="text-2xl font-bold mb-4">
                    {selectedQuiz.name} - Questions
                  </h2> */}
                  {selectedQuiz.questions.map((question, index) => (
                    <div key={index} className="mb-4 bg-gray-100 p-4 rounded">
                      <p className="font-semibold">
                        {index + 1}. {question.question}
                      </p>
                      <ul className="list-disc ml-6 mt-2">
                        {question.options.map((option, optionIndex) => (
                          <li
                            key={optionIndex}
                            className={
                              option.option === question.correctAnswer
                                ? "text-green-600 font-bold"
                                : ""
                            }
                          >
                            {option.option}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-blue-600">
                        Correct Answer: {question.correctAnswer}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Modal>
          )}
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
    </div>
  );
};

export default AdminProtedctedRoute(QuizManagementPage);
