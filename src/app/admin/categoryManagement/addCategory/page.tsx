"use client";

import React, { FormEvent, useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import axios from "axios";
import AdminProtedctedRoute from '@/HOC/AdminProtectedRoute';
import { CategoryErrors } from "@/utils/Types";
import { categorySchema } from "@/utils/Validation";
import useAdminAuthStore from "@/store/adminAuthStore";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const page = () => {
  const {token} = useAdminAuthStore()
  const [categoryName, setCategoryName] = useState<string>("");
  const [errors, setErrors] = useState<CategoryErrors>({});


  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleSubmit = async(e:FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validationResult  = categorySchema.safeParse({ categoryName });
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.format();
      setErrors({
        categoryName: fieldErrors.categoryName?._errors[0],
      });
      return;
    } else {
      setErrors({});
    }

    try {
      console.log('category add akkan pohn')
      const response = await axios.post(`${BACKEND_URL}/category/addCategory`,{
        categoryName
      },{
        headers :{
          Authorization:`Bearer ${token}`
        }
      })
      if (response.status === 201) {
        toast.success("Category added successfully!");
        router.push("/admin/categoryManagement");
      } else {
        toast.error("Category already exists with this name");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.error('Token expired or unauthorized. Redirecting to login...');
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('admin');
        toast.error("Token expired...Login again!");
        router.push('/admin');
      } else {
        console.error('Error adding category:', error);
      }
    }
  };


  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col font-sans">
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-4 w-full mt-5">
            <h1 className="text-3xl text-white">Add Category</h1>
            <div className="ml-auto">
            <button
                className="border border-gray-300 py-1 px-3 rounded-2xl text-white hover:text-black hover:bg-white"
                onClick={handleGoBack}
              >
                Go Back
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center mt-10">
            <div className="flex justify-center overflow-x-auto mt-10 bg-gray-800 p-8 rounded shadow-lg">
              <form onSubmit={handleSubmit}>
                <h1 className="text-3xl mb-4 text-white">Add Category</h1>
                <input
                  type="text"
                  placeholder="Enter country name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="mb-4 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                />
                {errors.categoryName && (
                <p className="mt-1 text-red-500 text-sm">{errors.categoryName}</p>
              )}
                <div className="flex justify-center">
                <button
                  className="px-4 py-1 rounded-2xl bg-blue-900 text-white hover:bg-blue-950"
                  type="submit"
                >
                  Add
                </button>
                </div>
                
              </form>
            </div>
          </div>
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
    </AdminLayout>
  );
};

export default AdminProtedctedRoute(page);
