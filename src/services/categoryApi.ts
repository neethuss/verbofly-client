import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

//for fetching all the available categories
export const fetchCategories = async(token:string, search?: string, page?: number, limit?: number,) => {
console.log('going to fetch categories')
  const response = await axios.get(`${BACKEND_URL}/category/categories`,{
    params : {
      search,
      page,
      limit
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  console.log(response,'going to fetch categories')
  return response.data
 
}

//Category block unblock
export const categoryBlockUnblock = async(action:string, id:string, token:string)=> {
  try {
    console.log(action,'action')
    console.log('forn')
    const response = await axios.patch(`${BACKEND_URL}/category/${action}/${id}`,{},{
      headers : {
        Authorization : `Bearer ${token}`
      }
    })
    console.log(response.data.isBlocked,'wht updated')
    return response.data
  } catch (error) {
    console.log(`Error ${action}ing category`, error);
  }
}