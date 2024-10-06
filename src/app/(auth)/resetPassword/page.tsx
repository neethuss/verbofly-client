'use client'

import React, { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast, ToastContainer } from "react-toastify"
import { FaLock, FaUnlock } from 'react-icons/fa'
import { resetPassword } from '@/services/userApi'
import { resetPasswordSchema } from '@/utils/Validation'
import { ResetErrors } from '@/utils/Types'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<ResetErrors>({})

  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      setErrors({ general: "All fields must be filled out" })
      return
    }

    setErrors({})
 
    const validationResult = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    })

    if (!validationResult.success) {
      const newErrors: ResetErrors = {}

      validationResult.error.errors.forEach((err) => {
        newErrors[err.path[0] as keyof ResetErrors] = err.message
      })

      setErrors(newErrors)
      return
    }
   
    const email = localStorage.getItem('email')
    if (!email) {
      toast.error("Email not found. Please try the password reset process again.")
      router.push('/forgotPassword')
      return
    }

    try {
      const data = await resetPassword(email, password)
      if (data) {
        localStorage.removeItem('email')
        console.log(data)
        toast.success("Password reset successfully")
        router.push('/login')
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to reset password. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">VerboFly</h1>
          <p className="mt-2 text-lg sm:text-xl">Reset Your Password</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {errors.general && <p className="text-red-500 text-xs sm:text-sm mb-4">{errors.general}</p>}

            <div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-red-500 text-xs sm:text-sm">{errors.password}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <FaUnlock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-red-500 text-xs sm:text-sm">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>
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