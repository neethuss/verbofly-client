'use client'

import { useState, useRef, useEffect, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast, ToastContainer } from "react-toastify"
import { FaPaperPlane } from 'react-icons/fa'
import { sendForgotPasswordEmail, verifyOtp } from "@/services/userApi"

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(60)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startTimer = (duration: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    const endTime = Date.now() + duration * 1000
    localStorage.setItem("otpTimerEnd", endTime.toString())

    const updateTimer = () => {
      const now = Date.now()
      const remainingTime = Math.max(Math.floor((endTime - now) / 1000), 0)
      setTimeLeft(remainingTime)
      
      if (remainingTime === 0) {
        setIsTimerRunning(false)
        localStorage.removeItem("otpTimerEnd")
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }

    updateTimer()
    timerRef.current = setInterval(updateTimer, 1000)
  }

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }

    const storedEndTime = localStorage.getItem("otpTimerEnd")
    if (storedEndTime) {
      const remainingTime = Math.max(Math.floor((parseInt(storedEndTime) - Date.now()) / 1000), 0)
      if (remainingTime > 0) {
        setTimeLeft(remainingTime)
        setIsTimerRunning(true)
        startTimer(remainingTime)
      } else {
        setIsTimerRunning(false)
        localStorage.removeItem("otpTimerEnd")
      }
    } else {
      startTimer(60)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return

    setOtp((prevOtp) => {
      const newOtp = [...prevOtp]
      newOtp[index] = element.value
      return newOtp
    })
    if (element.nextSibling instanceof HTMLInputElement) {
      (element.nextSibling as HTMLInputElement).focus()
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const otpString = otp.join("")
    const storedOtp = localStorage.getItem("otp")
    if (!storedOtp) {
      throw new Error("No OTP found in local storage")
    }
    try {
      const data = await verifyOtp(otpString, storedOtp)
      if (data) {
        console.log("Verification completed", data)
        toast.success("OTP verified successfully")
        localStorage.removeItem("otp")
        localStorage.removeItem("otpTimerEnd")
        router.push("/resetPassword")
      }
    } catch (error) {
      toast.error("Invalid OTP. Please try again.")
    }
  }

  const handleResendOtp = async () => {
    const email = localStorage.getItem("email")
    if (!email) {
      toast.error("Email not found. Please try again.")
      return
    }

    try {
      const data = await sendForgotPasswordEmail(email)
      console.log(data)
      if (data) {
        toast.info("New OTP sent to your email")
        localStorage.setItem("otp", data.otp)
        setOtp(["", "", "", "", "", ""]) 
        setIsTimerRunning(true)
        startTimer(60)  
        inputRefs.current[0]?.focus()  
      }
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">VerboFly</h1>
          <p className="mt-2 text-lg sm:text-xl">Enter OTP</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between mb-4">
              {otp.map((data, index) => (
                <input
                  className="w-12 h-12 bg-gray-700 border-2 border-gray-600 rounded-lg text-white text-center text-xl focus:border-yellow-400 focus:outline-none"
                  type="text"
                  name={`otp-${index}`}
                  maxLength={1}
                  key={index}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>
            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-300 ${
                  !isTimerRunning ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!isTimerRunning}
              >
                <FaPaperPlane className="mr-2" />
                Verify OTP
              </button>
              <p className="text-gray-400" aria-live="polite">
                Time remaining: {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </p>
              {!isTimerRunning && (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-yellow-400 hover:text-yellow-500 underline"
                >
                  Resend OTP
                </button>
              )}
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