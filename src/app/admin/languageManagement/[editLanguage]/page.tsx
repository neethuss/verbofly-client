"use client";

import AdminLayout from "@/components/AdminLayout";
import React, { FormEvent, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import AdminProtedctedRoute from "@/HOC/AdminProtectedRoute";
import Select from "react-select";
import { LanguageErrors } from "@/utils/Types";
import { languageSchema } from "@/utils/Validation";
import useAdminAuthStore from "@/store/adminAuthStore";

;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Country {
  _id: string;
  countryName: string;
  isBlocked:boolean
}

interface Language {
  id: string;
  languageName: string;
  countries: Country[];
}

const EditLanguagePage = () => {
  const {token, adminLogout} = useAdminAuthStore()
  const [language, setLanguage] = useState<Language | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [errors, setErrors] = useState<LanguageErrors>({});

  const router = useRouter();
  const { editLanguage } = useParams() as { editLanguage: string };

  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/language/${editLanguage}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setLanguage(response.data);
          setSelectedCountries(
            response.data.countries.map((country: Country) => country._id)
          );
        }

        // Fetch all countries to display in the dropdown
        const countriesResponse = await axios.get(
          `${BACKEND_URL}/country/countries`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(countriesResponse, "wht ");
        if (countriesResponse.status === 200) {
          const notBlockedCountries = countriesResponse.data.countries.filter((country:Country)=>!country.isBlocked)
          setCountries(notBlockedCountries);
        }
      } catch (error) {
        console.log("Error in fetching language details:", error);
        toast.error(
          "An error occurred while fetching language details. Please try again."
        );
      }
    };

    fetchLanguage();
  }, [editLanguage, token]);

  const handleGoBack = () => {
    router.back();
  };

  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const countriesSelected = Array.isArray(selectedCountries)
      ? selectedCountries
      : [];

    if (!language?.languageName || countriesSelected.length === 0) {
      setErrors({ general: "All fields must be filled out" });
      return;
    }
    setErrors({});

    const validationResult = languageSchema.safeParse({
      languageName: language.languageName,
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
      const response = await axios.patch(
        `${BACKEND_URL}/language/${editLanguage}`,
        {
          languageName: language?.languageName,
          countries: selectedCountries,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Edit successful");
        router.back();
      } else {
        toast.error("An error occurred during the update. Please try again.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 409) {
            toast.error("Language already exists with this name.");
          } else if (error.response.status === 404) {
            toast.error("Language not found.");
          }
        } else {
          toast.error("An error occurred during the update. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col font-sans">
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-4 w-full mt-5">
            <h1 className="text-3xl text-white">Edit Language</h1>
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
              <form onSubmit={handleEdit}>
                <h1 className="text-3xl mb-4 text-white text-center">
                  Edit Language
                </h1>
                {errors.general && (
                  <p className="text-red-500 text-xs mb-4">{errors.general}</p>
                )}
                <input
                  type="text"
                  placeholder="Enter language name"
                  value={language?.languageName}
                  onChange={(e) => setLanguage(prevLanguage => 
                    prevLanguage 
                      ? { ...prevLanguage, languageName: e.target.value }
                      : { id: '', languageName: e.target.value, countries: [] }
                  )}
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
                    label: country.countryName.charAt(0).toUpperCase() + country.countryName.slice(1),
                  }))}
                  className="mb-4 text-black"
                  value={selectedCountries
                    .map((id) => {
                      const country = countries.find((c) => c._id === id);
                      return country
                        ? { value: country._id, label: country.countryName }
                        : null;
                    })
                    .filter(Boolean)}
                  onChange={(selectedOptions) =>
                    setSelectedCountries(
                      selectedOptions
                        ? selectedOptions.map((option: any) => option.value)
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
                    Update
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

export default AdminProtedctedRoute(EditLanguagePage);
