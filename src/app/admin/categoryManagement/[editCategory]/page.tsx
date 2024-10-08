"use client"

import AdminLayout from '@/components/AdminLayout'
import React, { FormEvent, useEffect, useState } from 'react'
import {toast, ToastContainer } from 'react-toastify'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import AdminProtedctedRoute from '@/HOC/AdminProtectedRoute';
import { CategoryErrors } from '@/utils/Types'
import { categorySchema } from '@/utils/Validation'
import useAdminAuthStore from '@/store/adminAuthStore'


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const EditCategoryPage = () => {
const {token, adminLogout} = useAdminAuthStore()
  const [categoryName, setCategoryName] = useState<string>('')
  const [errors, setErrors] = useState<CategoryErrors>({});

  const router = useRouter()
  const {editCategory} = useParams() as {editCategory : string}

  useEffect( () => {
    const fetchCategory = async() => {
      console.log('back edit')
      try {
        const response = await axios.get(`${BACKEND_URL}/category/${editCategory}`,{
          headers :{
            Authorization:`Bearer ${token}`
          }
        })
        if(response.status === 200){
          setCategoryName(response.data.categoryName)
        }
       
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.error(
            "Token expired or unauthorized. Redirecting to login..."
          );
          toast.error("Token expired...Login again!");
          adminLogout()
        } else {
          console.error("Error fetching user data:", error);
        }
      }
    }
    fetchCategory()
  },[editCategory, adminLogout, token])

  const handleGoBack = () => {
    router.back()
  }

  const handleEdit = async(e: FormEvent<HTMLFormElement>) => {
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
      const response = await axios.patch(`${BACKEND_URL}/category/${editCategory}`,{
        categoryName
      },{
        headers :{
          Authorization:`Bearer ${localStorage.getItem('adminAccessToken')}`
        }
      })
      if(response.status === 200){
        toast.success("Edit successful")
        router.back()
      }else{
        toast.error("Category already exists with this name")
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 409) {
            toast.error("Category already exists with this name");
          } else if(error.response.status === 404){
            toast.error("Category not found")
          }
        } else {
          toast.error("An error occurred during login. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }


  return (
    <AdminLayout>
       <div className="min-h-screen flex flex-col font-sans">
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-4 w-full mt-5">
            <h1 className="text-3xl text-white">Edit Category</h1>
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
              <form onSubmit={handleEdit}>
                <h1 className="text-3xl mb-4 text-white">Edit Category</h1>
                <input
                  type="text"
                  placeholder="Enter category name"
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
                  Edit
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
  )
}

export default AdminProtedctedRoute(EditCategoryPage)
