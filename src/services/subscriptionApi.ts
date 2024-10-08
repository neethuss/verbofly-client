import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

//for fetching all subscription details
export const fetchAllSubscriptions = async(token:string, search?: string, page?: number, limit?: number,) => {
  console.log( search,
    page,
    limit)
  const response = await axios.get(`${BACKEND_URL}/subscription/subscriptions`,{
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
