"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from "react-toastify";
import { verifyOtp } from '@/services/userApi';

import React from 'react'

const Page = () => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    setOtp(prevOtp => {
      const newOtp = [...prevOtp];
      newOtp[index] = element.value;
      return newOtp;
    });
    if (element.nextSibling instanceof HTMLInputElement) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
   
      const otpString = otp.join('');
      const storedOtp = localStorage.getItem('otp');
      if (!storedOtp) {
        throw new Error('No OTP found in local storage');
      }
      const data = await verifyOtp(otpString, storedOtp)
      if (data) {
        console.log('Verification completed', data);
        toast.success("Otp verified successfully")
        localStorage.removeItem('otp');
        router.push('/resetPassword');
      }
    
      
  };

  return (
    <div className="bg-login-bg bg-cover min-h-screen flex items-center justify-center bg-dark-blue">
      <div className="border border-white/30 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          ENTER OTP THAT HAS BEEN SENT TO YOUR EMAIL
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between mb-8">
            {otp.map((data, index) => (
              <input
                className="w-12 h-12 bg-transparent border-2 border-white/30 rounded-lg text-white text-center text-xl focus:border-white focus:outline-none"
                type="text"
                name="otp"
                maxLength={1}
                key={index}
                value={data}
                onChange={e => handleChange(e.target, index)}
                onFocus={e => e.target.select()}
                ref={el => {
                  inputRefs.current[index] = el;
                }}
              />
            ))}
          </div>
          <div className='flex justify-center'>
            <button
              type="submit"
              className="bg-white text-dark-blue font-bold py-2 px-4 rounded hover:bg-white/90 transition duration-300"
            >
              VERIFY
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

export default Page;
