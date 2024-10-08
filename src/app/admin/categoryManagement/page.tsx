"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import AdminProtedctedRoute from "@/HOC/AdminProtectedRoute";
import { categoryBlockUnblock, fetchCategories } from "@/services/categoryApi";
import Modal from "@/components/Modal";
import { CiEdit } from "react-icons/ci";
import { CgUnblock } from "react-icons/cg";
import { MdBlock } from "react-icons/md";
import useAdminAuthStore from "@/store/adminAuthStore";
import LoadingPage from "@/components/Loading";

interface Category {
  _id: string;
  categoryName: string;
  isBlocked: boolean;
}

const CategoryManagementPage = () => {
  const {token} = useAdminAuthStore()
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchCharacters, setSearchCharacters] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [limit] = useState<number>(10);
  const [showModal, setShowModal] = React.useState(false);
  const [currentCategoryId, setCurrentCategoryId] = React.useState<string>("");
  const [currentAction, setCurrentAction] = React.useState<"block" | "unblock">(
    "block"
  );
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false)

  const router = useRouter();

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        setLoadingCategories(true)
        const data = await fetchCategories(
          token as string,
          searchCharacters,
          page,
          limit
        );
        if (data) {
          setCategories(data.categories);
          setTotalCategories(data.total);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.error(
            "Token expired or unauthorized. Redirecting to login..."
          );
          localStorage.removeItem("adminAccessToken");
          localStorage.removeItem("admin");
          toast.error("Token expired...Login again!");
          router.push("/admin");
        } else {
          console.error("Error fetching category data:", error);
        }
      }finally{
        setLoadingCategories(false)
      }
    };
    fetchCategoriesData();
  }, [searchCharacters, page, limit, router, token]);

  const handleBlockUnblock = async (
    id: string,
    action: "block" | "unblock"
  ) => {
    console.log("update block, unblock");
    const data = await categoryBlockUnblock(action, id, token as string);
    if (data) {
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category._id === id
            ? { ...category, isBlocked: !category.isBlocked }
            : category
        )
      );
      if (data.isBlocked) {
        toast.success("Category is blocked");
      } else {
        toast.success("Category is unblocked");
      }
    }
  };

  const handleAddCategory = () => {
    router.push("/admin/categoryManagement/addCategory");
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/categoryManagement/${id}`);
  };

  const totalPages = Math.ceil(totalCategories / limit);

  const handleOpenModal = (categoryId: string, action: "block" | "unblock") => {
    setCurrentCategoryId(categoryId);
    setCurrentAction(action);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleModalConfirm = async () => {
    await handleBlockUnblock(currentCategoryId, currentAction);
    setShowModal(false);
  };

  if(loadingCategories){
    return <LoadingPage/>
  }

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <AdminLayout>
        <div className="flex flex-col h-full">
          <div className="flex-grow overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 w-full mt-5">
              <h1 className="text-2xl sm:text-3xl text-white mb-4 sm:mb-0">
                Manage Category
              </h1>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search category..."
                  value={searchCharacters}
                  onChange={(e) => setSearchCharacters(e.target.value)}
                  className="px-4 py-2 rounded border-none bg-gray-800 text-white w-full sm:w-auto"
                />

                <button
                  className="bg-white text-blue-950 font-bold px-4 py-2 rounded-2xl w-full sm:w-auto"
                  onClick={handleAddCategory}
                >
                  Add Category
                </button>
              </div>
            </div>
            <div className="overflow-x-auto mt-10">
              <table className="min-w-full bg-gray-800">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-500">
                    <th className="py-2 px-4 text-white">Category Name</th>
                    <th className="py-2 px-4 text-white">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category._id}
                      className="border-b border-gray-500 text-center"
                    >
                      <td className="px-4 py-2 text-white">
                        {category?.categoryName.charAt(0).toUpperCase() +
                          category.categoryName.slice(1)}
                      </td>
                      <td className="px-4 py-2 text-white">
                        <div className="flex justify-center gap-3">
                          <CiEdit
                            className=" text-blue-800 cursor-pointer"
                            onClick={() => handleEdit(category._id)}
                          />

                          {category.isBlocked ? (
                            <CgUnblock
                              className=" text-green-600 cursor-pointer"
                              onClick={() =>
                                handleOpenModal(category._id, "unblock")
                              }
                            />
                          ) : (
                            <MdBlock
                              className=" text-red-600 cursor-pointer"
                              onClick={() =>
                                handleOpenModal(category._id, "block")
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

export default AdminProtedctedRoute(CategoryManagementPage);
