"use client"

import React from 'react'
import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from "react-toastify";
import { sendForgotPasswordEmail } from '@/services/userApi';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');

  const router = useRouter()

  const handleChange = (e : ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target
    if(name === "email"){
      setEmail(value)
    }
  }

  const handleSubmit = async(e : FormEvent<HTMLFormElement>) => {
    e.preventDefault();
      const data = await sendForgotPasswordEmail(email)
       if(data){
        console.log(data.otp,'otp undo')
        localStorage.setItem('email',data.email)
        localStorage.setItem('otp',data.otp)
        router.push('/verifyOtp')
    
      }
    
  };

  return (
    <div className="bg-login-bg bg-cover min-h-screen flex items-center justify-center ">
      <div className="border border-white/30 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-4">
          FORGOT YOUR PASSWORD?
        </h1>
        <h2 className="text-xl text-white/80 text-center mb-8">
          ENTER YOUR EMAIL TO SEND OTP
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full bg-transparent border border-white/30 rounded px-4 py-2 text-white mb-6 focus:outline-none focus:border-white"
            required
          />
          
          <div className='flex justify-center'>
          <button
            type="submit"
            className=" bg-white text-dark-blue font-bold py-2 px-4 rounded hover:bg-white/90 transition duration-300"
          >
            SEND OTP
          </button>
          </div>
          
        </form>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default ForgotPasswordPage
