"use client";

import React, { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import AdminProtedctedRoute from "@/HOC/AdminProtectedRoute";
import { countryBlockUnblock, fetchCountries } from "@/services/countryApi";
import Modal from "@/components/Modal";
import { CiEdit } from "react-icons/ci";
import { CgUnblock } from "react-icons/cg";
import { MdBlock } from "react-icons/md";
import useAdminAuthStore from "@/store/adminAuthStore";
import LoadingPage from "@/components/Loading";

interface Country {
  _id: string;
  countryName: string;
  isBlocked: boolean;
}

const CountryManagementPage = () => {
  const { token, adminLogout } = useAdminAuthStore();
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchCharacters, setSearchCharacters] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalCountries, setTotalCountries] = useState<number>(0);
  const [limit] = useState<number>(10);
  const [showModal, setShowModal] = React.useState(false);
  const [currentCountryId, setCurrentCountryId] = React.useState<string>("");
  const [currentAction, setCurrentAction] = React.useState<"block" | "unblock">(
    "block"
  );
  const [loadingCountries, setLoadingCountries] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchCharacters);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchCharacters]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchCountriesData = useCallback(async () => {
    try {
      setLoadingCountries(true);
      const data = await fetchCountries(
        token as string,
        debouncedSearch,
        page,
        limit
      );
      if (data) {
        setCountries(data.countries);
        setTotalCountries(data.total);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.error("Token expired or unauthorized. Redirecting to login...");
        toast.error("Token expired...Login again!");
        adminLogout();
      } else {
        console.error("Error fetching users data:", error);
      }
    } finally {
      setLoadingCountries(false);
    }
  }, [debouncedSearch, page, limit, adminLogout, token]);

  useEffect(() => {
    fetchCountriesData();
  }, [fetchCountriesData]);

  const handleBlockUnblock = async (
    id: string,
    action: "block" | "unblock"
  ) => {
    console.log("update block, unblock");
    const data = await countryBlockUnblock(action, id, token as string);
    if (data) {
      setCountries((prevCountries) =>
        prevCountries.map((country) =>
          country._id === id
            ? { ...country, isBlocked: !country.isBlocked }
            : country
        )
      );
      if (data.isBlocked) {
        toast.success("Country is blocked");
      } else {
        toast.success("Country is unblocked");
      }
    }
  };

  const handleAddCountry = () => {
    router.push("/admin/countryManagement/addCountry");
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/countryManagement/${id}`);
  };

  const totalPages = Math.ceil(totalCountries / limit);

  const handleOpenModal = (countryId: string, action: "block" | "unblock") => {
    setCurrentCountryId(countryId);
    setCurrentAction(action);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleModalConfirm = async () => {
    await handleBlockUnblock(currentCountryId, currentAction);
    setShowModal(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchCharacters(e.target.value);
    };

  if (loadingCountries) {
    return (
      <AdminLayout>
              <LoadingPage />
            </AdminLayout>
    )
  }

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <AdminLayout>
        <div className="flex flex-col h-full">
          <div className="flex-grow overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 w-full mt-5">
              <h1 className="text-2xl sm:text-3xl text-white mb-4 sm:mb-0">
                Manage Country
              </h1>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search country..."
                  value={searchCharacters}
                  onChange={handleSearchChange}
                  autoFocus={searchCharacters.length > 0}
                  className="px-4 py-2 rounded border-none bg-gray-800 text-white w-full sm:w-auto"
                />

                <button
                  className="bg-white text-blue-950 font-bold px-4 py-2 rounded-2xl w-full sm:w-auto"
                  onClick={handleAddCountry}
                >
                  Add Country
                </button>
              </div>
            </div>
            <div className="overflow-x-auto mt-10">
              <table className="min-w-full bg-gray-800">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-500">
                    <th className="py-2 px-4 text-white">Country Name</th>
                    <th className="py-2 px-4 text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {countries.map((country) => (
                    <tr
                      key={country._id}
                      className="border-b border-gray-500 text-center"
                    >
                      <td className="px-4 py-2 text-white">
                        {country.countryName.charAt(0).toUpperCase() +
                          country.countryName.slice(1)}
                      </td>
                      <td className="px-4 py-2 text-white">
                        <div className="flex justify-center gap-3">
                          <CiEdit
                            className=" text-blue-800 cursor-pointer"
                            onClick={() => handleEdit(country._id)}
                          />

                          {country.isBlocked ? (
                            <CgUnblock
                              className=" text-green-600 cursor-pointer"
                              onClick={() =>
                                handleOpenModal(country._id, "unblock")
                              }
                            />
                          ) : (
                            <MdBlock
                              className=" text-red-600 cursor-pointer"
                              onClick={() =>
                                handleOpenModal(country._id, "block")
                              }
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-auto py-4">
            <div className="flex justify-center items-center space-x-4">
              <button
                className="px-4 py-1 border border-gray-300 text-white rounded disabled:opacity-50"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-white">
                Page {page} of {totalPages}
              </span>
              <button
                className="px-4 py-1 border border-gray-300 text-white rounded disabled:opacity-50"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {showModal && (
          <Modal
            onClose={handleCloseModal}
            title={`Are you sure you want to ${currentAction}?`}
          >
            <div className="flex justify-between">
              <button
                onClick={handleModalConfirm}
                className="bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={handleCloseModal}
                className="bg-red-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </Modal>
        )}

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
    </div>
  );
};

export default AdminProtedctedRoute(CountryManagementPage);
