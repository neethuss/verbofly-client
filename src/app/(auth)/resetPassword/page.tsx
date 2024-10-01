"use client"

import React from 'react'
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ResetErrors } from '@/utils/Types';
import { toast, ToastContainer } from "react-toastify";
import { resetPassword } from '@/services/userApi';
import { resetPasswordSchema } from '@/utils/Validation';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<ResetErrors>({});

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if any field is empty
    if (!password || !confirmPassword) {
      setErrors({ general: "All fields must be filled out" });
      return;
    }

    // Clear any previous general error
    setErrors({});
 
    const validationResult = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!validationResult.success) {
      const newErrors: ResetErrors = {};

      validationResult.error.errors.forEach((err) => {
        newErrors[err.path[0] as keyof ResetErrors] = err.message;
      });

      setErrors(newErrors);
      return;
    }
   

      const email = localStorage.getItem('email') 
      const data = await resetPassword(email as string, password)
      if(data){
        localStorage.removeItem('email')
        console.log(data)
        toast.success("Password reset successfully")
        router.push('/login')
      }else{
        console.log('')
      }
      
    
    
  };

  return (
    <div className="bg-login-bg bg-cover min-h-screen flex items-center justify-center bg-dark-blue">
      <div className="border border-white/30 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          SET YOUR NEW PASSWORD
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && <p className="text-red-500 text-xs mb-4">{errors.general}</p>}

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full bg-transparent border border-white/30 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white transition duration-300"
          
            />
            <p className="text-red-500 text-xs min-h-[1em]">
                  {errors.password}
                </p>
          </div>
          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full bg-transparent border border-white/30 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white transition duration-300"
             
            />
            <p className="text-red-500 text-xs min-h-[1em]">
              {errors.confirmPassword}
            </p>
          </div>
          
          
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-white text-dark-blue font-bold py-2 px-6 rounded hover:bg-white/90 transition duration-300"
            >
              RESET
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

export default ResetPasswordPage
