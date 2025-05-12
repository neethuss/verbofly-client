"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { fetchLanguages } from "@/services/languageApi";
import Select from "react-select";
import { fetchCategories } from "@/services/categoryApi";
import { addQuiz } from "@/services/quizApi";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
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

const AddQuizPage = () => {
  const {token, adminLogout} = useAdminAuthStore()
  const [name, setName] = useState<string>("");
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [questions, setQuestions] = useState<IQuizQuestion[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState({
    name: "",
    language: "",
    category: "",
    questions: ""
  });
  const [newQuestion, setNewQuestion] = useState<{
    question: string;
    options: { option: string; isCorrect: boolean }[];
    correctAnswer: string;
  }>({
    question: "",
    options: [
      { option: "", isCorrect: false }, 
      { option: "", isCorrect: false }, 
      { option: "", isCorrect: false }, 
      { option: "", isCorrect: false }
    ],
    correctAnswer: "",
  });
  const router = useRouter();

  // Constants for validation
  const MIN_QUESTIONS = 5;
  const MAX_QUESTIONS = 15;

  useEffect(() => {
    const fetchLanguagesData = async () => {
      const data = await fetchLanguages(token as string);
      setLanguages(data.languages);
    };

    const fetchCategoriesData = async () => {
      const data = await fetchCategories(token as string);
      setCategories(data.categories);
    };

    fetchLanguagesData();
    fetchCategoriesData();
  }, [token]);

  const handleOpenModal = () => {
    if (questions.length >= MAX_QUESTIONS) {
      toast.warning(`You can add a maximum of ${MAX_QUESTIONS} questions per quiz`);
      return;
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewQuestion({ ...newQuestion, question: e.target.value });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = { option: e.target.value, isCorrect: newOptions[index].isCorrect };
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const handleCorrectAnswerChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const optionValue = e.target.value;
    // Update all options' isCorrect status
    const updatedOptions = newQuestion.options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === index
    }));
    
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions,
      correctAnswer: optionValue
    });
  };

  const validateQuestion = () => {
    // Check if question is empty
    if (newQuestion.question.trim() === "") {
      return { valid: false, message: "Question cannot be empty" };
    }
    
    // Check if any option is empty
    if (!newQuestion.options.every(opt => opt.option.trim() !== "")) {
      return { valid: false, message: "All options must be filled" };
    }
    
    // Check if correct answer is selected
    if (newQuestion.correctAnswer.trim() === "") {
      return { valid: false, message: "Please select a correct answer" };
    }
    
    return { valid: true, message: "" };
  };

  const isQuestionValid = () => {
    const { valid } = validateQuestion();
    return valid;
  };

  const handleSubmit = () => {
    const validation = validateQuestion();
    
    if (validation.valid) {
      const questionToAdd: IQuizQuestion = {
        question: newQuestion.question,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer
      };
      
      setQuestions([...questions, questionToAdd]);
      handleCloseModal();

      setFormErrors({...formErrors, questions: ""});
    } else {
      toast.error(validation.message);
    }
  };

  const handleDelete = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    
    if (updatedQuestions.length < MIN_QUESTIONS) {
      setFormErrors({
        ...formErrors, 
        questions: `Minimum ${MIN_QUESTIONS} questions required`
      });
    }
  };


  const handleAddQuiz = async () => {
    try {
      if (!name.trim()) {
        toast.error("Please enter a quiz name");
        return;
      }
      
      if (!selectedLanguage) {
        toast.error("Please select a language");
        return;
      }
      
      if (!selectedCategory) {
        toast.error("Please select a category");
        return;
      }
      
      if (questions.length < MIN_QUESTIONS) {
        toast.error(`Please add at least ${MIN_QUESTIONS} questions to create a quiz`);
        return;
      }
      
      if (questions.length > MAX_QUESTIONS) {
        toast.error(`A quiz can have a maximum of ${MAX_QUESTIONS} questions`);
        return;
      }
      
      const response = await addQuiz(
        token as string,
        name,
        selectedLanguage as string,
        selectedCategory as string,
        questions
      );
      
      if (response.status === 201) {
        toast.success("Quiz created successfully");
        router.push("/admin/quizManagement");
      } else if(response.status === 200){
        toast.warning(`Quiz already exists in the selected category and language`);
      }
    } catch (error) {
      toast.error("Failed to create quiz. Please try again.");
      console.error("Error creating quiz:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen p-4 flex flex-col font-sans">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Add New Quiz</h1>
          <button onClick={()=> router.push('/admin/quizManagement')} className="bg-transparent border border-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors">
            Go back
          </button>
        </div>

        <div className="flex-grow flex justify-center items-start">
          <div className="bg-transparent border border-gray-500 p-6 rounded-lg shadow-md w-full max-w-md">
            <div className="mb-4">
              <label htmlFor="quizName" className="block mb-2 font-semibold text-white">
                Quiz Name
              </label>
              <input
                id="quizName"
                type="text"
                placeholder="Enter quiz name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormErrors({...formErrors, name: ""});
                }}
                className={`w-full p-2 border rounded-md bg-transparent ${formErrors.name ? 'border-red-500' : 'border-gray-300'} text-white`}
              />
              {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
            </div>
            
            <div className="mb-6 text-black">
              <label htmlFor="language" className="block mb-2 font-semibold text-white">
                Language
              </label>
              <Select
                id="language"
                options={languages.map((language) => ({
                  value: language._id,
                  label: language.languageName.charAt(0).toUpperCase() + language.languageName.slice(1),
                }))}
                onChange={(selected) => {
                  setSelectedLanguage(selected?.value || null);
                  setFormErrors({...formErrors, language: ""});
                }}
                className={`w-full ${formErrors.language ? 'border-red-500 rounded-md border' : ''}`}
              />
              {formErrors.language && <p className="text-red-500 text-sm mt-1">{formErrors.language}</p>}
            </div>

            <div className="mb-6 text-black">
              <label htmlFor="categories" className="block mb-2 font-semibold text-white">
                Category
              </label>
              <Select
                id="categories"
                options={categories.map((category) => ({
                  value: category._id,
                  label: category.categoryName.charAt(0).toUpperCase() + category.categoryName.slice(1),
                }))}
                onChange={(selected) => {
                  setSelectedCategory(selected?.value || null);
                  setFormErrors({...formErrors, category: ""});
                }}
                className={`w-full ${formErrors.category ? 'border-red-500 rounded-md border' : ''}`}
              />
              {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
            </div>

            <div className="mb-4">
              <p className="text-white mb-2">Questions Added: {questions.length}</p>
              {formErrors.questions && <p className="text-red-500 text-sm mt-1">{formErrors.questions}</p>}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleOpenModal}
                className="bg-transparent border border-gray-700 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors flex-grow"
              >
                Add Question +
              </button>

              <button
                onClick={handleAddQuiz}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors flex-grow"
              >
                Add Quiz
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
                  <button
                    onClick={() => handleDelete(index)}
                    className="mt-2 text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex justify-center items-center z-50">
          <div className="bg-transparent border border-gray-300 p-6 rounded-lg w-full max-w-md text-white">
            <h2 className="text-xl font-bold mb-4">Add new question</h2>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Question</label>
              <input
                type="text"
                value={newQuestion.question}
                onChange={handleQuestionChange}
                className="border w-full p-2 rounded-md bg-transparent border-gray-700"
              />
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
                    className="border flex-grow p-2 rounded-md bg-transparent border-gray-700"
                  />
                  <input
                    type="radio"
                    name="correctAnswer"
                    value={opt.option}
                    checked={opt.isCorrect}
                    onChange={(e) => handleCorrectAnswerChange(e, index)}
                    className="h-4 w-4 bg-transparent border-gray-700"
                  />
                </div>
              </div>
            ))}

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
                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Add Question
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

export default AdminProtedctedRoute(AddQuizPage);