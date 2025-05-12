"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { fetchLanguages } from "@/services/languageApi";
import Select from "react-select";
import { fetchCategories } from "@/services/categoryApi";
import { editQuizById, fetchQuizById } from "@/services/quizApi";
import { toast, ToastContainer } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import useAdminAuthStore from "@/store/adminAuthStore";
import AdminProtedctedRoute from "@/HOC/AdminProtectedRoute";

interface ILanguage {
  _id: string;
  languageName: string;
}

interface ICategory {
  _id: string;
  categoryName: string;
}

interface IQuizOption {
  option: string;
  isCorrect: boolean;
}

interface IQuizQuestion {
  question: string;
  options: IQuizOption[];
  correctAnswer: string;
}

interface INewQuestion {
  question: string;
  options: IQuizOption[];
  correctAnswer: string;
}

const EditQuizPage = () => {
  const { token } = useAdminAuthStore();
  const [name, setName] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");
  const [languageError, setLanguageError] = useState<string>("");
  const [categoryError, setCategoryError] = useState<string>("");
  const [questionsError, setQuestionsError] = useState<string>("");
  const [minQuestionsRequired] = useState<number>(5);
  const [maxQuestionsAllowed] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [questions, setQuestions] = useState<IQuizQuestion[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<{
    value: string;
    label: string;
  } | null>(null);
  
  const [newQuestion, setNewQuestion] = useState<INewQuestion>({
    question: "",
    options: [
      { option: "", isCorrect: false },
      { option: "", isCorrect: false },
      { option: "", isCorrect: false },
      { option: "", isCorrect: false }
    ],
    correctAnswer: "",
  });
  
  const [questionErrors, setQuestionErrors] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: ""
  });
  
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  
  const router = useRouter();
  const { editQuiz } = useParams() as { editQuiz: string };

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchQuizById(token as string, editQuiz);
        console.log(data, "data quiz");

        setName(data.name);
        setSelectedLanguage({
          value: data.languageName._id,
          label: data.languageName.languageName,
        });
        setSelectedCategory({
          value: data.categoryName._id,
          label: data.categoryName.categoryName,
        });

        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
        }

        const languagesResponse = await fetchLanguages(token as string);
        setLanguages(languagesResponse.languages);

        const categoriesResponse = await fetchCategories(token as string);
        setCategories(categoriesResponse.categories);
      } catch (error) {
        console.log("Error in fetching quiz details:", error);
        toast.error(
          "An error occurred while fetching quiz details. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [editQuiz, token]);

  const validateQuizData = () => {
    let isValid = true;
    let errorMessages = [];

    if (!name.trim()) {
      setNameError("Quiz name is required");
      errorMessages.push("Quiz name is required");
      isValid = false;
    } else {
      setNameError("");
    }

    if (!selectedLanguage) {
      setLanguageError("Please select a language");
      errorMessages.push("Language selection is required");
      isValid = false;
    } else {
      setLanguageError("");
    }

    if (!selectedCategory) {
      setCategoryError("Please select a category");
      errorMessages.push("Category selection is required");
      isValid = false;
    } else {
      setCategoryError("");
    }

    if (questions.length < minQuestionsRequired) {
      setQuestionsError(`At least ${minQuestionsRequired} questions are required`);
      errorMessages.push(`At least ${minQuestionsRequired} questions are required`);
      isValid = false;
    } else if (questions.length > maxQuestionsAllowed) {
      setQuestionsError(`Maximum ${maxQuestionsAllowed} questions are allowed`);
      errorMessages.push(`Maximum ${maxQuestionsAllowed} questions are allowed`);
      isValid = false;
    } else {
      setQuestionsError("");
    }

    if (!isValid) {
      toast.error(errorMessages.join(", "));
    }

    return isValid;
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewQuestion({ ...newQuestion, question: e.target.value });
    validateQuestionField('question', e.target.value);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = { 
      ...newOptions[index],
      option: e.target.value 
    };
    setNewQuestion({ ...newQuestion, options: newOptions });
    validateOptionField(index, e.target.value);
  };

  const handleCorrectAnswerChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    optionIndex: number
  ) => {
    const optionValue = e.target.value;
    
    setNewQuestion(prev => ({
      ...prev,
      correctAnswer: optionValue
    }));
    
    const updatedOptions = newQuestion.options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === optionIndex
    }));
    
    setNewQuestion(prev => ({
      ...prev,
      options: updatedOptions
    }));

    validateCorrectAnswer(optionValue);
  };

  const validateQuestionField = (field: string, value: string) => {
    if (field === 'question') {
      if (!value.trim()) {
        setQuestionErrors(prev => ({ ...prev, question: "Question is required" }));
        return false;
      } else {
        setQuestionErrors(prev => ({ ...prev, question: "" }));
        return true;
      }
    }
    return true;
  };

  const validateOptionField = (index: number, value: string) => {
    const newErrors = [...questionErrors.options];
    if (!value.trim()) {
      newErrors[index] = "Option is required";
      setQuestionErrors(prev => ({ ...prev, options: newErrors }));
      return false;
    } else {
      newErrors[index] = "";
      setQuestionErrors(prev => ({ ...prev, options: newErrors }));
      return true;
    }
  };

  const validateCorrectAnswer = (value: string) => {
    if (!value.trim()) {
      setQuestionErrors(prev => ({ ...prev, correctAnswer: "Please select a correct answer" }));
      return false;
    } else {
      setQuestionErrors(prev => ({ ...prev, correctAnswer: "" }));
      return true;
    }
  };

  const isQuestionValid = () => {
    const isQuestionFieldValid = validateQuestionField('question', newQuestion.question);
    
    const areOptionsValid = newQuestion.options.every((opt, index) => 
      validateOptionField(index, opt.option)
    );
    
    const isCorrectAnswerValid = validateCorrectAnswer(newQuestion.correctAnswer);
    
    if (!isQuestionFieldValid || !areOptionsValid || !isCorrectAnswerValid) {
      const errors = [];
      
      if (!isQuestionFieldValid) errors.push("Question field is required");
      if (!areOptionsValid) errors.push("All options must be filled");
      if (!isCorrectAnswerValid) errors.push("Please select a correct answer");
      
      toast.error(errors.join(", "));
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (isQuestionValid()) {
      if (questions.length >= maxQuestionsAllowed && editingQuestionIndex === null) {
        toast.error(`Maximum ${maxQuestionsAllowed} questions are allowed`);
        return;
      }
      
      if (editingQuestionIndex !== null) {
        // editing an existing question
        const updatedQuestions = [...questions];
        updatedQuestions[editingQuestionIndex] = newQuestion;
        setQuestions(updatedQuestions);
        toast.success("Question updated successfully!");
      } else {
        //adding a new question
        setQuestions([...questions, newQuestion]);
        toast.success("Question added successfully!");
      }
      handleCloseModal();
    }
  };

  const handleOpenModal = () => {
    if (questions.length >= maxQuestionsAllowed) {
      toast.error(`Maximum ${maxQuestionsAllowed} questions are allowed`);
      return;
    }
    
    setEditingQuestionIndex(null);
    setNewQuestion({
      question: "",
      options: [
        { option: "", isCorrect: false },
        { option: "", isCorrect: false },
        { option: "", isCorrect: false },
        { option: "", isCorrect: false }
      ],
      correctAnswer: "",
    });
    setQuestionErrors({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: ""
    });
    setShowModal(true);
  };

  const handleEditQuestion = (index: number) => {
    const questionToEdit = questions[index];
    setEditingQuestionIndex(index);
    
    let options = [...questionToEdit.options];
    while (options.length < 4) {
      options.push({ option: "", isCorrect: false });
    }
    
    setNewQuestion({
      question: questionToEdit.question,
      options: options,
      correctAnswer: questionToEdit.correctAnswer,
    });
    
    setQuestionErrors({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: ""
    });
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuestionIndex(null);
    setNewQuestion({
      question: "",
      options: [
        { option: "", isCorrect: false },
        { option: "", isCorrect: false },
        { option: "", isCorrect: false },
        { option: "", isCorrect: false }
      ],
      correctAnswer: "",
    });
    setQuestionErrors({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: ""
    });
  };

  const handleDelete = (index: number) => {
    if (questions.length <= minQuestionsRequired) {
      toast.error(`At least ${minQuestionsRequired} questions are required`);
      return;
    }
    
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    toast.success("Question deleted successfully!");
  };

  const handleEditQuiz = async () => {
    if (!validateQuizData()) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await editQuizById(
        token as string,
        editQuiz,
        name,
        selectedLanguage?.value as string,
        selectedCategory?.value as string,
        questions
      );
      console.log(response,'response');
      if (response.status === 200) {
        toast.success("Quiz updated successfully");
        router.push("/admin/quizManagement");
      } else if (response.status === 409) {
        toast.warn(
          `Quiz already existing in the selected category in selected language`
        );
      }
    } catch (error) {
      toast.error("Failed to update quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen p-4 flex flex-col font-sans">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Edit Quiz</h1>
          <button
            onClick={() => router.push("/admin/quizManagement")}
            className="bg-transparent border border-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
            disabled={isLoading}
          >
            Go back
          </button>
        </div>

        <div className="flex-grow flex justify-center items-start">
          <div className="bg-transparent border border-gray-500 p-6 rounded-lg shadow-md w-full max-w-md">
            <div className="mb-4">
              <label
                htmlFor="quizName"
                className="block mb-2 font-semibold text-white"
              >
                Quiz Name
              </label>
              <input
                type="text"
                id="quizName"
                value={name}
                placeholder="Enter quiz name"
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setNameError("");
                }}
                className={`w-full p-2 border rounded-md bg-transparent text-white ${
                  nameError ? "border-red-500" : "border-gray-300"
                }`}
              />
             
            </div>
            
            <div className="mb-6 text-black">
              <label
                htmlFor="language"
                className="block mb-2 font-semibold text-white"
              >
                Language
              </label>
              <Select
                options={languages?.map((language) => ({
                  value: language._id,
                  label:
                    language.languageName.charAt(0).toUpperCase() +
                    language.languageName.slice(1),
                }))}
                value={selectedLanguage}
                onChange={(option) => {
                  setSelectedLanguage(
                    option as { value: string; label: string }
                  );
                  setLanguageError("");
                }}
                className={`w-full ${languageError ? "border-red-500" : ""}`}
              />
              
            </div>

            <div className="mb-6 text-black">
              <label
                htmlFor="categories"
                className="block mb-2 font-semibold text-white"
              >
                Category
              </label>
              <Select
                options={categories?.map((category) => ({
                  value: category._id,
                  label:
                    category.categoryName.charAt(0).toUpperCase() +
                    category.categoryName.slice(1),
                }))}
                value={selectedCategory}
                onChange={(option) => {
                  setSelectedCategory(
                    option as { value: string; label: string }
                  );
                  setCategoryError("");
                }}
                className={`w-full ${categoryError ? "border-red-500" : ""}`}
              />
             
            </div>

            <div className="mb-2">
              <p className="text-white">
                Questions Added: {questions.length}
              </p>
             
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleOpenModal}
                className="bg-transparent border border-gray-700 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors flex-grow"
                disabled={isLoading}
              >
                Add Question +
              </button>

              <button
                onClick={handleEditQuiz}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors flex-grow"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Apply changes"}
              </button>
            </div>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Questions Added ({questions.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {questions.map((ques, index) => (
                <div
                  key={index}
                  className="bg-white p-3 border rounded-md shadow-sm"
                >
                  <h3 className="font-semibold truncate">{ques.question}</h3>
                  <div className="flex justify-between mt-2">
                    <button
                      onClick={() => handleEditQuestion(index)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex justify-center items-center z-50">
          <div className="bg-transparent border border-gray-300 p-6 rounded-lg w-full max-w-md text-white">
            <h2 className="text-xl font-bold mb-4">
              {editingQuestionIndex !== null ? "Edit Question" : "Add New Question"}
            </h2>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Question</label>
              <input
                type="text"
                value={newQuestion.question}
                onChange={handleQuestionChange}
                className={`border w-full p-2 rounded-md bg-transparent ${
                  questionErrors.question ? "border-red-500" : "border-gray-700"
                }`}
              />
              {questionErrors.question && (
                <p className="text-red-500 text-sm mt-1">{questionErrors.question}</p>
              )}
            </div>
            {newQuestion.options.map((opt, index) => (
              <div key={index} className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Option {index + 1}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={opt.option}
                    onChange={(e) => handleInputChange(e, index)}
                    className={`border flex-grow p-2 rounded-md bg-transparent ${
                      questionErrors.options[index] ? "border-red-500" : "border-gray-700"
                    }`}
                  />
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={opt.option}
                    checked={opt.isCorrect || newQuestion.correctAnswer === opt.option}
                    onChange={(e) => handleCorrectAnswerChange(e, index)}
                    className="h-4 w-4 bg-transparent border-gray-700"
                  />
                </div>
                
              </div>
            ))}
            
            {questionErrors.correctAnswer && (
              <p className="text-red-500 text-sm mt-1">{questionErrors.correctAnswer}</p>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className={`${
                  editingQuestionIndex !== null 
                    ? "bg-blue-500 hover:bg-blue-600" 
                    : "bg-yellow-500 hover:bg-yellow-600"
                } text-white px-4 py-2 rounded-md transition-colors`}
              >
                {editingQuestionIndex !== null ? "Update Question" : "Add Question"}
              </button>
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
    </AdminLayout>
  );
};

export default AdminProtedctedRoute(EditQuizPage);