import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getChatorCreateChat = async (currentUserId: string, otherUserId: string) => {
  // console.log(currentUserId, otherUserId, 'ids front')
  const response = await axios.get(`${BACKEND_URL}/chat/${currentUserId}/${otherUserId}`)
  return response.data
}

export const getChatMessages = async (chatId: string) => {
  // console.log(chatId, 'id')
  const response = await axios.get(`${BACKEND_URL}/chat/message/${chatId}/messages`)
  return response.data
}

export const saveMessage = async (chatId: string, senderId: string, messageText: string) => {
  const response = await axios.post(`${BACKEND_URL}/chat/message`, {
    chatId, senderId, messageText
  })
  return response.data
}


export const saveImage = async (chatId: string, senderId: string, fileUrl: string) => {
  const response = await axios.post(`${BACKEND_URL}/chat/image`, {
    chatId, senderId, fileUrl
  })
  return response.data
}

export const saveAudio = async (chatId: string, senderId: string, fileUrl: string) => {
  const response = await axios.post(`${BACKEND_URL}/chat/audio`, {
    chatId, senderId, fileUrl
  })
  return response.data
}


export const getUserChats = async (userId: string) => {
  const response = await axios.get(`${BACKEND_URL}/chat/chats/${userId}/getuserchats`)
  // console.log(response.data, 'fr')
  return response.data
}

export const uploadImage = async (chatId: string, senderId: string, formData: FormData) => {
  console.log('Uploading image with', { chatId, senderId });
  formData.append('chatId', chatId);
  formData.append('senderId', senderId);
  const response = await axios.post(`${BACKEND_URL}/chat/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  // console.log(response.data, 'what')
  return response.data;
};


export const uploadAudio = async (chatId: string, senderId: string, formData: FormData) => {
  console.log('Uploading image with', { chatId, senderId });
  formData.append('chatId', chatId);
  formData.append('senderId', senderId);
  const response = await axios.post(`${BACKEND_URL}/chat/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  // console.log(response.data, 'what')
  return response.data;
};


export const markAsRead = async (chatId: string, userId: string) => {
  // console.log('mark frnt')
  const response = await axios.post(`${BACKEND_URL}/chat/markAsRead`, { chatId, userId });
  return response.data
};
