import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


//post admin login
export const postLogin = async(email:string, password:string) => {
  try {
    console.log(email,password,'cred @ api')
    const response = await axios.post(`${BACKEND_URL}/admin`,{
      email, password
    },{
      withCredentials:true
    })
    return response.data
  } catch (error) {
    
  }
}