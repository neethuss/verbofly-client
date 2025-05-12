import axios from "axios";

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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const addQuiz = async (token: string, name: string, languageName: string, categoryName: string, questions: IQuizQuestion[]) => {
  console.log('adding quiz ')
  console.log('addQuiz', 'name,languageName,categoryName,questions', name, languageName, categoryName, questions)
  const response = await axios.post(`${BACKEND_URL}/quiz/addQuiz`, { name, languageName, categoryName, questions }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response
}

export const fetchQuizByLanguageAndCategory = async (token: string, languageId: string, categoryId: string) => {
  const response = await axios.get(`${BACKEND_URL}/quiz/${languageId}/${categoryId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  console.log(response.data)
  return response.data
}

export const fetchQuizzes = async (token: string, search?: string, page?: number, limit?: number,) => {
  const response = await axios.get(`${BACKEND_URL}/quiz/quizzes`, {
    params: {
      search,
      page,
      limit
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const fetchQuizById = async (token: string, quizId: string,) => {
  console.log('lesson, wat')
  const response = await axios.get(`${BACKEND_URL}/quiz/${quizId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}


export const editQuizById = async (token: string, quizId: string, name: string, languageName: string, categoryName: string, questions: IQuizQuestion[]) => {
  const response = await axios.patch(`${BACKEND_URL}/quiz/${quizId}`, { name, languageName, categoryName, questions }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response
}

export const deleteQuizById = async (token: string, quizId: string,) => {
  const response = await axios.delete(`${BACKEND_URL}/quiz/${quizId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return response
}