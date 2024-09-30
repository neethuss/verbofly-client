
"use client"
import React, { FormEvent, ChangeEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import { postLogin } from "@/services/userApi";
import { loginSchema } from "@/utils/Validation";
import useAuthStore from "@/store/authStore";
import axios from "axios";
import { LoginErrors } from "@/utils/Types";

const LoginPage = () => {
  const { isAuthenticated, setUserAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrors({ general: "All fields must be filled out" });
      return;
    }
    setErrors({});

    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.format();
      setErrors({
        email: fieldErrors.email?._errors[0],
        password: fieldErrors.password?._errors[0],
      });
      return;
    }

    try {
      const data = await postLogin(email, password);
      if (data) {
        toast.success("Login successful!");
        const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000;
        localStorage.setItem("userAccessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user.user));
        localStorage.setItem("userExpiresAt", expiresAt.toString());
        setUserAuth(data);
        router.push("/dashboard");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 401) {
            toast.error("Invalid password");
          } else if (error.response.status === 404) {
            toast.error("User not found with this email");
          } else if (error.response.status === 403) {
            toast.error("User is blocked");
          } else {
            toast.error("An unexpected error occurred in login");
          }
        } else {
          toast.error("An error occurred during login. Please try again.");
        }
      } else {
        toast.error("An error occurred during login. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400">VerboFly</h1>
          <p className="mt-2 text-lg sm:text-xl">Sign in to your account</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {errors.general && <p className="text-red-500 text-xs sm:text-sm mb-4">{errors.general}</p>}

            <div>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-red-500 text-xs sm:text-sm">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-red-500 text-xs sm:text-sm">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs sm:text-sm">
                <Link
                  href="/forgotPassword"
                  className="font-medium text-yellow-400 hover:text-yellow-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <FaSignInAlt className="mr-2" />
                Sign in
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-400">
          Not a member?{" "}
          <Link
            href="/signup"
            className="font-medium text-yellow-400 hover:text-yellow-500"
          >
            Sign up now
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
  );
};

export default LoginPage;