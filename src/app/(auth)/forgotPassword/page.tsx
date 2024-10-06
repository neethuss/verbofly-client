'use client'

import React, { useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa'
import { sendForgotPasswordEmail } from '@/services/userApi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ email?: string }>({})
  const router = useRouter()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setErrors({})
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!email) {
      setErrors({ email: 'Email is required' })
      return
    }

    try {
      const data = await sendForgotPasswordEmail(email)
      if (data) {
        localStorage.setItem('email', data.email)
        localStorage.setItem('otp', data.otp)
        toast.success('OTP sent successfully!')
        router.push('/verifyOtp')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">VerboFly</h1>
          <p className="mt-2 text-lg sm:text-xl">Forgot Your Password?</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-red-500 text-xs sm:text-sm">{errors.email}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <FaPaperPlane className="mr-2" />
                Send OTP
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-400">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-yellow-400 hover:text-yellow-500"
          >
            Sign in
          </Link>
        </p>
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
  )
}