"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchQuizByLanguageAndCategory } from "@/services/quizApi";
import { updateProgress } from "@/services/userApi";
import useAuthStore from "@/store/authStore";

interface IQuizOption {
  option: string;
  isCorrect: boolean;
}

interface IQuizQuestion {
  question: string;
  options: IQuizOption[];
  correctAnswer: string;
}

const questionTimeout = 30;

const QuizPage = () => {
  const { languageId, categoryId } = useParams();
  const { user } = useAuthStore();
  const router = useRouter();
  const [questions, setQuestions] = useState<IQuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(questionTimeout);
  const [quizResult, setQuizResult] = useState<string>("");

  const userId = user?.user?._id;

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");

    const fetchQuizData = async () => {
      const data = await fetchQuizByLanguageAndCategory(
        token as string,
        languageId as string,
        categoryId as string
      );
      setQuestions(data.questions);
    };
    fetchQuizData();
  }, [languageId, categoryId]);

  useEffect(() => {
    if (questions.length > 0 && !showScore) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleNext();
            return questionTimeout;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [questions, currentQuestionIndex, showScore]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNext = async () => {
    if (questions[currentQuestionIndex].correctAnswer === selectedOption) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setSelectedOption("");
      setCurrentIndex(currentQuestionIndex + 1);
      setTimeLeft(questionTimeout);
    } else {
      const token = localStorage.getItem("userAccessToken");
      console.log("object");
      const result = score >= questions.length / 2 ? "passed" : "failed";
      console.log(result, "result");
      setQuizResult(result);
      try {
        const data = await updateProgress(
          token as string,
          userId,
          languageId as string,
          undefined,
          undefined,
          result as string
        );
        console.log(data);
      } catch (error) {
        console.error("Error updating quiz progress:", error);
      }

      setShowScore(true);
    }
  };

  if (showScore) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="max-w-3xl w-full bg-transparent border p-10 rounded-lg text-center">
          <h1 className="text-5xl font-extrabold mb-8 text-yellow-400">
            Quiz Completed!
          </h1>
          <div className="bg-gray-800 py-8 px-4 rounded-md shadow-md mb-8">
            <h2 className="text-3xl font-semibold text-gray-300">Your Score</h2>
            <div className="text-7xl font-extrabold text-teal-500 mt-4">
              {score} / {questions.length}
            </div>
            <div
              style={{ color: quizResult === "passed" ? "yellow" : "red" }}
            >
              {quizResult === "passed"
                ? "🤩Congratulations! You passed!"
                : "☹️Sorry, you failed."}
            </div>
          </div>

          <button
            onClick={() => router.back()}
            className="bg-teal-500 text-white px-8 py-4 rounded-lg text-xl font-medium hover:bg-teal-600 transition-transform transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Loading questions...</h1>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-sans">
      <div className="text-2xl font-bold text-teal-500">{timeLeft}s</div>

      <div className="max-w-2xl w-full bg-transparent border border-gray-800 p-6 rounded-md shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-yellow-400 ">
          {currentQuestionIndex + 1}. {currentQuestion.question}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {currentQuestion.options.map((opt, index) => (
            <div
              key={index}
              className={`flex items-center justify-between px-4 py-3 rounded-md border cursor-pointer transition-all duration-200 ${
                selectedOption === opt.option
                  ? "bg-green-500 border-teal-500 shadow-lg"
                  : "hover:bg-gray-100 hover:text-gray-900 hover:shadow-md"
              }`}
              onClick={() => handleOptionSelect(opt.option)}
            >
              <span className="text-lg font-medium">
                {String.fromCharCode(97 + index)}) {opt.option}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={handleNext}
            className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-yellow-400 transition-all duration-200 shadow-md"
            disabled={!selectedOption}
          >
            {isLastQuestion ? "View Results" : "Next"}
          </button>
        </div>
      </div>
      <div className="mt-6 text-lg text-gray-400">
        Question {currentQuestionIndex + 1} / {questions.length}
      </div>
    </div>
  );
};

export default QuizPage;
