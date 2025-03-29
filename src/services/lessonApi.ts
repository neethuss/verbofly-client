import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

//for fetching all available lessons
export const fetchLessons = async(token:string, search?: string, page?: number, limit?: number,) => {
  const response = await axios.get(`${BACKEND_URL}/lesson/lessons`,{
    params : {
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

//Lesson block unblock
export const lessonBlockUnblock = async(action:string, id:string, token:string)=> {
  try {
    console.log(action,'action')
    console.log('forn')
    const response = await axios.patch(`${BACKEND_URL}/lesson/${action}/${id}`,{},{
      headers : {
        Authorization : `Bearer ${token}`
      }
    })
    console.log(response.data.isBlocked,'wht updated')
    return response.data
  } catch (error) {
    console.log(`Error ${action}ing lesson`, error);
  }
}


//for fetching a particular lesson
export const fetchLesson = async( token:string,lessonId:string,) => {
  console.log('lesson, wat')
  const response = await axios.get(`${BACKEND_URL}/lesson/${lessonId}`,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}


//fetch lessons in a particular category in a particular language
export const fetchLessonsInCategoryInLanguage = async(token:string, languageId:string, categoryId:string) => {
  const response = await axios.get(`${BACKEND_URL}/lesson/${languageId}/${categoryId}`,{
    headers :{
      Authorization : `Bearer ${token}`
    }
  })
  return response.data
}

//fetch lessons on particular a language
export const fetchLessonsOnLanguage = async(token:string, languageId:string) => {
  console.log(languageId,'lang lessons ed')
  const response = await axios.get(`${BACKEND_URL}/lesson/language/${languageId}`,{
    headers : {
      Authorization : `Bearer ${token}`
    }
  })
  return response.data
}

export const translateLanguage = async(text:string, sourceLanguage:string, targetLanguage:string)=>{
  const response = await axios.post(`https://api.mymemory.translated.net/get?q=${text}&langpair=${sourceLanguage}|${targetLanguage}`)
  return response
}


export const addLesson = async(token:string, formData:FormData) => {
  const response = await axios.post(`${BACKEND_URL}/lesson/addLesson`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response
}

export const editALesson = async(token:string,lessonId:string, formData:FormData) => {
  console.log(formData, 'bofy data')
  const response = await axios.patch(`${BACKEND_URL}/lesson/${lessonId}`, formData,{
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response
}