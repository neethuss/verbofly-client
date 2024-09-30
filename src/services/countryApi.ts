import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

//for fetching all available countries
export const fetchCountries = async(token:string, search?: string, page?: number, limit?: number,) => {
  const response = await axios.get(`${BACKEND_URL}/country/countries`,{
    params : {
      search,
      page,
      limit
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  console.log(response.data,'res')
  return response.data
}

//Country block unblock
export const countryBlockUnblock = async(action:string, id:string, token:string)=> {
  try {
    console.log(action,'action')
    console.log('forn')
    const response = await axios.patch(`${BACKEND_URL}/country/${action}/${id}`,{},{
      headers : {
        Authorization : `Bearer ${token}`
      }
    })
    console.log(response.data.isBlocked,'wht updated')
    return response.data
  } catch (error) {
    console.log(`Error ${action}ing country`, error);
  }
}