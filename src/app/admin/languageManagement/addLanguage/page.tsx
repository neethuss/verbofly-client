"use client";

import React, { FormEvent, useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import axios from "axios";
import AdminProtedctedRoute from "@/HOC/AdminProtectedRoute";
import Select from "react-select";
import { LanguageErrors } from "@/utils/Types";
import { languageSchema } from "@/utils/Validation";
import useAdminAuthStore from "@/store/adminAuthStore";
import { fetchCountries } from "@/services/countryApi";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Country {
  _id: string;
  countryName: string;
  isBlocked :boolean
}

const AddLanguagePage = () => {
  const {token, adminLogout} = useAdminAuthStore()
  const [languageName, setLanguageName] = useState<string>("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [errors, setErrors] = useState<LanguageErrors>({});

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/country/countries`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const notBlockedCountries = response.data.countries.filter((country:Country)=>!country.isBlocked)
        setCountries(notBlockedCountries);
      } catch (error) {
        console.log("Error fetching countries", error);
      }
    };
    fetchCountries();
  }, [token]);

  

  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const countriesSelected = Array.isArray(selectedCountries)
      ? selectedCountries
      : [];

    if (!languageName || countriesSelected.length === 0) {
      setErrors({ general: "All fields must be filled out" });
      return;
    }
    setErrors({});

    const validationResult = languageSchema.safeParse({
      languageName,
      countries: countriesSelected,
    });
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.format();
      setErrors({
        languageName: fieldErrors.languageName?._errors[0],
        countries: fieldErrors.countries?._errors[0],
      });
      return;
    } else {
      setErrors({});
    }
    try {
      console.log("add la");
      const response = await axios.post(
        `${BACKEND_URL}/language/addLanguage`,
        { languageName, countries: selectedCountries },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) {
        toast.success("Language added successfully!");
        router.push("/admin/languageManagement");
      } else {
        toast.error("Language already exists with this name");
      }
    } catch (error) {
      console.log("Error in add language component:", error);
      toast.error("An error occurred during add language. Please try again.");
    }
  };


  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col font-sans">
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-4 w-full mt-5">
            <h1 className="text-3xl text-white">Add Language</h1>
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
            <div className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-lg">
              <form onSubmit={handleSubmit}>
                <h1 className="text-3xl mb-4 text-white text-center">
                  Add Language
                </h1>
                {errors.general && (
                  <p className="text-red-500 text-xs mb-4">{errors.general}</p>
                )}
                <input
                  type="text"
                  placeholder="Enter language name"
                  value={languageName}
                  onChange={(e) => setLanguageName(e.target.value)}
                  className="mb-4 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                />
                {errors.languageName && (
                  <p className="mt-1 text-red-500 text-sm">
                    {errors.languageName}
                  </p>
                )}
                <Select
                  isMulti
                  options={countries.map((country) => ({
                    value: country._id,
                    label: country.countryName,
                  }))}
                  className="mb-4 text-black"
                  onChange={(selectedOptions) =>
                    setSelectedCountries(
                      selectedOptions
                        ? selectedOptions.map((option) => option.value)
                        : []
                    )
                  }
                />
                {errors.countries && (
                  <p className="mt-1 text-red-500 text-sm">
                    {errors.countries}
                  </p>
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

export default AdminProtedctedRoute(AddLanguagePage);
