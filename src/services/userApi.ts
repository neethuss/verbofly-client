// src/app/services/userApi.ts
import axios from "axios";
import { toast } from "react-toastify";

interface Country {
  _id: string;
  countryName: string;
  isBlocked: boolean;
}

interface Language {
  _id: string;
  languageName: string;
}

interface User {
  username?: string;
  email?: string;
  country?: Country;
  nativeLanguage?: Language;
  knownLanguages?: Language[];
  languagesToLearn?: Language[];
  bio?: string;
  profilePhoto?: string;
  coverPhoto?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Post signup
export const postSignup = async (username: string, email: string, password: string) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/signup`, {
      username, email, password
    });
    return response;
  } catch (error) {
    
  }
};

// Post login
export const postLogin = async (email: string, password: string) => {
 
    const response = await axios.post(`${BACKEND_URL}/api/login`, {
      email, password
    }, {
      withCredentials: true
    });
    return response.data;
  
};

// Forgot password email submission
export const sendForgotPasswordEmail = async (email: string) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/forgotPassword`, {
      email
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 404) {
          toast.error("User not found with this email");
        } 
      } else {
        toast.error("An error occurred during login. Please try again.");
      }
    } else {
      toast.error("An unexpected error occurred");
    }
  }
};

// Verifying OTP
export const verifyOtp = async (otpString: string, storedOtp: string) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/forgotPassword/verifyOtp`, {
      otpString, storedOtp
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 400) {
          toast.error("Invalid otp");
        } 
      } else {
        toast.error("An error occurred during login. Please try again.");
      }
    } else {
      toast.error("An unexpected error occurred");
    }
  
  }
};


// Resetting password
export const resetPassword = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/forgotPassword/resetPassword`, {
      email, password
    });
    return response.data;
  } catch (error) {
    
  }
};


// Fetching data for a particular user
export const fetchUser = async (token: string) => {
    const response = await axios.get(`${BACKEND_URL}/api/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data;
  
};

export const fetchUserById = async (token: string, userId:string) => {
  const response = await axios.get(`${BACKEND_URL}/api/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return response.data;

};


//check is block

export const checkBlock = async (token: string) => {
  
  const response = await axios.get(`${BACKEND_URL}/api/check`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return response.data;

};



//updating user details
export const updateUser = async(token:string, user:User) => {
  const response = await axios.patch(`${BACKEND_URL}/api/user`,
    user
  ,{
    headers : {
      Authorization :`Bearer ${token}`
    }
  })
  return response.data
}


//uploading profile image
export const updateProfileImage = async (token: string, profileImageFile: File) => {
  const formData = new FormData();
  formData.append("file", profileImageFile);

  try {
    const response = await axios.post(`${BACKEND_URL}/api/upload?type=profile`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.url;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error; // Propagate error to be handled in handleSave
  }
};

//fetching all users details
export const fetchUsers = async(token:string, search?: string, page?: number, limit?: number,) => {

  const response = await axios.get(`${BACKEND_URL}/api/users`,{
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

//User block unblock
export const userBlockUnblock = async(action:string, id:string, token:string)=> {
  try {
    const response = await axios.patch(`${BACKEND_URL}/api/user/${action}/${id}`,{},{
      headers : {
        Authorization : `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    console.log(`Error ${action}ing user`, error);
  }
}


//update user lesson progress
export const updateProgress = async(token:string, userId:string, languageId:string, lessonId?:string, isCompleted?:boolean, result?:string) => {
  const response = await axios.post(`${BACKEND_URL}/api/progress`,{
    userId,languageId, isCompleted,lessonId, result
  },{
    headers:{
      Authorization :`Bearer ${token}`
    }
  })
  return response.data
}

//user progress in a particular lesson
export const getLessonProgress = async(token:string, languageId:string, categoryId:string) => {
  const response = await axios.get(`${BACKEND_URL}/api/lessonProgress/${languageId}/${categoryId}`,{
    headers : {
      Authorization : `Bearer ${token}`
    }
  })
  return response.data
}


//user progress 
export const getUserProgress = async(token:string) => {
  const response = await axios.get(`${BACKEND_URL}/api/progress/userProgress`,{
    headers : {
      Authorization : `Bearer ${token}`
    }
  })
  return response

}



//fetching all users details
export const fetchNativeSpeakers = async (
  token: string,
  search?: string,
  page?: number,
  limit?: number,
  filterCountry?: string,
  filterLanguage?: string
) => {
  const params: any = {
    search,
    page,
    limit,
    filterCountry,
    filterLanguage,
  };

  // Remove undefined values from params
  Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
  const response = await axios.get(`${BACKEND_URL}/connection/native/speakers`, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

//send connection request
export const sendConnectionRequest = async(token:string,receiverId:string) =>{
   const response = await axios.patch(`${BACKEND_URL}/connection/sendConnection`,{
    receiverId
   },{
    headers:{
      Authorization:  `Bearer ${token}`
    }
   })
   return response.data
}

//cancel connection request
export const cancelConnectionRequest = async(token:string,cancelId:string) =>{
  const response = await axios.patch(`${BACKEND_URL}/connection/cancelConnection`,{
    cancelId
  },{
   headers:{
     Authorization:  `Bearer ${token}`
   }
  })
  return response.data
}


//cancel connection request
export const rejectConnectionRequest = async(token:string,rejectId:string) =>{
  const response = await axios.patch(`${BACKEND_URL}/connection/rejectConnection`,{
    rejectId
  },{
   headers:{
     Authorization:  `Bearer ${token}`
   }
  })
  return response.data
}

//accept connection request
export const acceptConnectionRequest = async(token:string,acceptId:string) =>{
  const response = await axios.patch(`${BACKEND_URL}/connection/acceptConnection`,{
    acceptId
  },{
   headers:{
     Authorization:  `Bearer ${token}`
   }
  })
  return response.data
}