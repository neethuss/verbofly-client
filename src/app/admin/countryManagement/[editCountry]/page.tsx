"use client"

import AdminLayout from '@/components/AdminLayout'
import React, { FormEvent, useEffect, useState } from 'react'
import {toast, ToastContainer } from 'react-toastify'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import AdminProtedctedRoute from '@/HOC/AdminProtectedRoute';
import { CountryErrors } from '@/utils/Types'
import { countrySchema } from '@/utils/Validation'
import useAdminAuthStore from '@/store/adminAuthStore'


const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const page = () => {
const {token, adminLogout} = useAdminAuthStore()
  const [countryName, setCountryName] = useState<string>('')
  const [errors, setErrors] = useState<CountryErrors>({});

  const router = useRouter()
  const {editCountry} = useParams() as {editCountry : string}

  useEffect( () => {
    const fetchCountry = async() => {
      try {
        const response = await axios.get(`${BACKEND_URL}/country/${editCountry}`,{
          headers :{
            Authorization:`Bearer ${token}`
          }
        })
        if(response.status === 200){
          setCountryName(response.data.countryName)
        }
       
      } catch (error) {
        console.log("Error in edit country component:", error);
        toast.error("An error occurred during edit country. Please try again.");
      }
    }
    fetchCountry()
  },[editCountry])

  const handleGoBack = () => {
    router.back()
  }

  const handleEdit = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validationResult  = countrySchema.safeParse({ countryName });
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.format();
      setErrors({
        countryName: fieldErrors.countryName?._errors[0],
      });
      return;
    } else {
      setErrors({});
    }

    try {
      const response = await axios.patch(`${BACKEND_URL}/country/${editCountry}`,{
        countryName
      },{
        headers :{
          Authorization:`Bearer ${token}`
        }
      })
      if(response.status === 200){
        toast.success("Edit successful")
        router.back()
      }else{
        toast.error("Country already exists with this name")
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 409) {
            toast.error("Country already exists with this name");
          } else if(404){
            toast.error("Country not found")
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
            <h1 className="text-3xl text-white">Edit Country</h1>
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
                <h1 className="text-3xl mb-4 text-white">Edit Country</h1>
                <input
                  type="text"
                  placeholder="Enter country name"
                  value={countryName}
                  onChange={(e) => setCountryName(e.target.value)}
                  className="mb-4 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                />
                {errors.countryName && (
                <p className="mt-1 text-red-500 text-sm">{errors.countryName}</p>
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

export default AdminProtedctedRoute(page)
