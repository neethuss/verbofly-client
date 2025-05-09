"use client"

import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import AdminProtedctedRoute from '@/HOC/AdminProtectedRoute';
import { useRouter } from "next/navigation";
import { fetchUsers, userBlockUnblock } from "@/services/userApi";
import Modal from "@/components/Modal";
import { CgUnblock } from "react-icons/cg";
import { MdBlock } from "react-icons/md";
import LoadingPage from "@/components/Loading";

interface Country {
  id: string;
  countryName: string;
}

interface Language {
  id: string;
  languageName: string;
  countries: Country[];
}

interface User {
  _id: string;
  username: string;
  email: string;
  isBlocked: boolean;
  country?: Country;
  nativeLanguage?: Language;
  knownLanguages?: Language[];
  languagesToLearn?: Language[];
  profilePhoto?: string;
  coverPhoto?: string;
  bio?: string;
}

const Page = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchCharacters, setSearchCharacters] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [limit] = useState<number>(5);
  const [showModal, setShowModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentAction, setCurrentAction] = useState<"block" | "unblock">("block");
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

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

  const fetchUsersData = useCallback(async () => {
    const token = localStorage.getItem("adminAccessToken");
    if (!token) {
      router.push("/admin");
      return;
    }

    try {
      setLoadingUsers(true);
      const data = await fetchUsers(token, debouncedSearch, page, limit);
      if (data) {
        setUsers(data.users);
        setTotalUsers(data.total);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.error("Token expired or unauthorized. Redirecting to login...");
        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("admin");
        toast.error("Token expired...Login again!");
        router.push("/admin");
      } else {
        console.error("Error fetching users data:", error);
        toast.error("Failed to load users");
      }
    } finally {
      setLoadingUsers(false);
    }
  }, [debouncedSearch, page, limit, router]);

  useEffect(() => {
    fetchUsersData();
  }, [fetchUsersData]);

  const totalPages = Math.ceil(totalUsers / limit);

  const handleBlockUnblock = async (id: string, action: "block" | "unblock") => {
    const token = localStorage.getItem("adminAccessToken");
    try {
      const data = await userBlockUnblock(action, id, token as string);
      if (data) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === id ? { ...user, isBlocked: !user.isBlocked } : user
          )
        );
        if (data.isBlocked) {
          toast.success("User is blocked");
        } else {
          toast.success("User is unblocked");
        }
      }
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleOpenModal = (userId: string, action: "block" | "unblock") => {
    setCurrentUserId(userId);
    setCurrentAction(action);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleModalConfirm = async () => {
    await handleBlockUnblock(currentUserId, currentAction);
    setShowModal(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCharacters(e.target.value);
  };

  if (loadingUsers) {
    return (
      <AdminLayout>
        <LoadingPage />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col p-4 font-sans">
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 w-full mt-5">
            <h1 className="text-2xl sm:text-3xl text-white mb-4 sm:mb-0">Manage Users</h1>
            <div className="w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search users..."
                value={searchCharacters}
                onChange={handleSearchChange}
                className="w-full sm:w-auto px-4 py-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                autoFocus={searchCharacters.length > 0}
              />
            </div>
          </div>
          
          {users.length === 0 ? (
            <div className="text-white text-center mt-10">
              {debouncedSearch ? "No users found matching your search." : "No users available."}
            </div>
          ) : (
            <div className="overflow-x-auto mt-10">
              <table className="min-w-full bg-gray-800">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-500">
                    <th className="py-2 px-4 text-white md:table-cell">Username</th>
                    <th className="py-2 px-4 text-white md:table-cell">Email</th>
                    <th className="py-2 px-4 text-white md:table-cell">Country</th>
                    <th className="py-2 px-4 text-white md:table-cell">Native Language</th>
                    <th className="py-2 px-4 text-white md:table-cell">Known languages</th>
                    <th className="py-2 px-4 text-white md:table-cell">Languages to learn</th>
                    <th className="py-2 px-4 text-white md:table-cell">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-500 text-center">
                      <td className="px-4 py-2 text-white">{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</td>
                      <td className="px-4 py-2 text-white">{user.email}</td>
                      <td className="px-4 py-2 text-white">
                        {user?.country?.countryName ? user.country.countryName.charAt(0).toUpperCase() + user.country.countryName.slice(1) : "N/A"}
                      </td>
                      <td className="px-4 py-2 text-white">
                        {user?.nativeLanguage?.languageName ? user.nativeLanguage.languageName.charAt(0).toUpperCase() + user.nativeLanguage.languageName.slice(1) : "N/A"}
                      </td>
                      <td className="px-4 py-2 text-white">
                        {user.knownLanguages && user.knownLanguages.length > 0 
                          ? user.knownLanguages.map((language) => language.languageName.charAt(0).toUpperCase() + language.languageName.slice(1)).join(", ") 
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 text-white">
                        {user.languagesToLearn && user.languagesToLearn.length > 0 
                          ? user.languagesToLearn.map((language) => language.languageName.charAt(0).toUpperCase() + language.languageName.slice(1)).join(", ") 
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 text-white">
                        {user.isBlocked ? (
                          <button 
                            className="text-green-600"
                            onClick={() => handleOpenModal(user._id, "unblock")}
                            aria-label="Unblock user"
                          >
                            <CgUnblock size={24} />
                          </button>
                        ) : (
                          <button 
                            className="text-red-600"
                            onClick={() => handleOpenModal(user._id, "block")}
                            aria-label="Block user"
                          >
                            <MdBlock size={24} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 0 && (
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
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || totalPages === 0}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <Modal onClose={handleCloseModal} title={`Are you sure you want to ${currentAction} this user?`}>
          <div className="flex justify-between">
            <button
              onClick={handleModalConfirm}
              className="bg-blue-600 p-2 rounded-xl text-white"
            >
              Yes
            </button>
            <button
              onClick={handleCloseModal}
              className="bg-red-600 p-2 rounded-xl text-white"
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
  );
};

export default AdminProtedctedRoute(Page);