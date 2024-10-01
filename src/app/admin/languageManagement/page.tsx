"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import AdminProtedctedRoute from "@/HOC/AdminProtectedRoute";
import { fetchLanguages, languageBlockUnblock } from "@/services/languageApi";
import Modal from "@/components/Modal";
import { CiEdit } from "react-icons/ci";
import { CgUnblock } from "react-icons/cg";
import { MdBlock } from "react-icons/md";
import useAdminAuthStore from "@/store/adminAuthStore";

interface Country {
  _id: string;
  countryName: string;
}

interface Language {
  _id: string;
  languageName: string;
  countries: Country[];
  isBlocked: boolean;
}

const LanguageManagementPage = () => {
  const {token, adminLogout} = useAdminAuthStore()
  const [languages, setLanguages] = useState<Language[]>([]);
  const [searchCharacters, setSearchCharacters] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalLanguages, setTotalLanguages] = useState<number>(0);
  const [limit] = useState<number>(10);
  const [showModal, setShowModal] = React.useState(false);
  const [currentLanguageId, setCurrentLanguageId] = React.useState<string>("");
  const [currentAction, setCurrentAction] = React.useState<"block" | "unblock">(
    "block"
  );

  const router = useRouter();

  useEffect(() => {
    const fetchLanguagesData = async () => {
      try {
        const data = await fetchLanguages(
          token as string,
          searchCharacters,
          page,
          limit
        );
        if (data) {
          setLanguages(data.languages);
          setTotalLanguages(data.total);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.error(
            "Token expired or unauthorized. Redirecting to login..."
          );
          toast.error("Token expired...Login again!");
          adminLogout()
        } else {
          console.error("Error fetching users data:", error);
        }
      }
    };
    fetchLanguagesData();
  }, [searchCharacters, page, limit, adminLogout, token]);

  const handleBlockUnblock = async (
    id: string,
    action: "block" | "unblock"
  ) => {
    const data = await languageBlockUnblock(action, id, token as string);
    if (data) {
      setLanguages((prevLanguages) =>
        prevLanguages.map((language) =>
          language._id === id
            ? { ...language, isBlocked: !language.isBlocked }
            : language
        )
      );
      if (data.isBlocked) {
        toast.success("Language is blocked");
      } else {
        toast.success("Language is unblocked");
      }
    }
  };

  const handleAddLanguage = () => {
    router.push("/admin/languageManagement/addLanguage");
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/languageManagement/${id}`);
  };

  const totalPages = Math.ceil(totalLanguages / limit);

  const handleOpenModal = (languageId: string, action: "block" | "unblock") => {
    setCurrentLanguageId(languageId);
    setCurrentAction(action);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleModalConfirm = async () => {
    await handleBlockUnblock(currentLanguageId, currentAction);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <AdminLayout>
        <div className="flex flex-col h-full">
          <div className="flex-grow overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 w-full mt-5">
              <h1 className="text-2xl sm:text-3xl text-white mb-4 sm:mb-0">
                Manage Language
              </h1>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search language..."
                  value={searchCharacters}
                  onChange={(e) => setSearchCharacters(e.target.value)}
                  className="px-4 py-2 rounded border-none bg-gray-800 text-white w-full sm:w-auto"
                />

                <button
                  className="bg-white text-blue-950 font-bold px-4 py-2 rounded-2xl w-full sm:w-auto"
                  onClick={handleAddLanguage}
                >
                  Add Language
                </button>
              </div>
            </div>
            <div className="overflow-x-auto mt-10">
              <table className="min-w-full bg-gray-800">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-500">
                    <th className="py-2 px-4 text-white">Language Name</th>
                    <th className="py-2 px-4 text-white">
                      Available Countries
                    </th>
                    <th className="py-2 px-4 text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {languages.map((language) => (
                    <tr
                      key={language._id}
                      className="border-b border-gray-500 text-center"
                    >
                      <td className="px-4 py-2 text-white">
                        {language.languageName.charAt(0).toUpperCase() +
                          language.languageName.slice(1)}
                      </td>
                      <td className="px-4 py-2 text-white">
                        {language.countries.length > 0 ? (
                          <ul>
                            {language.countries.map((country) => (
                              <li key={country._id}>
                                {country.countryName.charAt(0).toUpperCase() +
                                  country.countryName.slice(1)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span>No countries available</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-white">
                      <div className="flex justify-center gap-3">
                          <CiEdit
                            className=" text-blue-800 cursor-pointer"
                            onClick={() => handleEdit(language._id)}
                          />

                          {language.isBlocked ? (
                            <CgUnblock
                              className=" text-green-600 cursor-pointer"
                              onClick={() =>
                                handleOpenModal(language._id, "unblock")
                              }
                            />
                          ) : (
                            <MdBlock
                              className=" text-red-600 cursor-pointer"
                              onClick={() =>
                                handleOpenModal(language._id, "block")
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

export default AdminProtedctedRoute(LanguageManagementPage);
