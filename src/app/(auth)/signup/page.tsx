"use client"

import React, { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import { SignupErrors } from "@/utils/Types";
import { postSignup } from "@/services/userApi";
import { signupSchema } from "@/utils/Validation";
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<SignupErrors>({});

  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "username") setUsername(value);
    else if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
    else if (name === "confirmPassword") setConfirmPassword(value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      setErrors({ general: "All fields must be filled out" });
      return;
    }

    setErrors({});
 
    const validationResult = signupSchema.safeParse({
      username,
      email,
      password,
      confirmPassword,
    });

    if (!validationResult.success) {
      const newErrors: SignupErrors = {};
      validationResult.error.errors.forEach((err) => {
        newErrors[err.path[0] as keyof SignupErrors] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    try {
      const response = await postSignup(username, email, password);
      if (response) {
        if (response.status === 201) {
          toast.success("Signup successful!");
          router.push("/login");
        } else if (response.status === 200) {
          toast.error("User already exists with this email");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } catch (error) {
      console.log("Error in signup component:", error);
      toast.error("An error occurred during signup. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex">
      <div className="flex-1 flex items-center justify-center">
        <div className="hidden md:block w-1/2 p-8">
          <h1 className="text-5xl font-extrabold text-white sm:text-6xl md:text-7xl">
            Join <span className="text-yellow-400">VerboFly</span>
          </h1>
          <p className="mt-4 max-w-3xl text-xl text-gray-300 sm:text-2xl">
            Start your language learning journey today!
          </p>
        </div>
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-yellow-400">Sign Up</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && <p className="text-red-500 text-sm mb-4">{errors.general}</p>}

            <div>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            </div>

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
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
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
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            </div>

            <div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <FaUserPlus className="mr-2" />
                Sign Up
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-yellow-400 hover:text-yellow-500">
                  Login
                </Link>
              </p>
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
  );
};

export default SignupPage;