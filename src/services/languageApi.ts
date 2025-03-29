import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

//for fetching all the available languages
export const fetchLanguages = async(token:string, search?: string, page?: number, limit?: number) => {
console.log('going to fetch languages')
  const response = await axios.get(`${BACKEND_URL}/language/languages`,{
    params : {
      search,
      page,
      limit
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  console.log(response,'going to fetch languages')
  return response.data
 
}

//fetch language by id
export const fetchLanguageById = async( token:string,languageId:string,) => {
  const response = await axios.get(`${BACKEND_URL}/language/${languageId}`,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

//Language block unblock
export const languageBlockUnblock = async(action:string, id:string, token:string)=> {
  try {
    console.log(action,'action')
    const response = await axios.patch(`${BACKEND_URL}/language/${action}/${id}`,{},{
      headers : {
        Authorization : `Bearer ${token}`
      }
    })
    console.log(response.data.isBlocked,'wht updated')
    return response.data
  } catch (error) {
    console.log(`Error ${action}ing language`, error);
  }


}