"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaLanguage,
  FaUser,
  FaBook,
  FaUsers,
  FaQuestionCircle,
} from "react-icons/fa";
import { GiProgression } from "react-icons/gi";
import { MdPayment } from "react-icons/md";
import { IoMdChatboxes } from "react-icons/io";
import useAuthStore from "@/store/authStore";
import ProtectedRoute from "@/HOC/ProtectedRoute";
import LoadingPage from "@/components/Loading";
import Modal from "@/components/Modal";
import { translateLanguage } from "@/services/lessonApi";
import Image from "next/image";
import { checkBlock } from "@/services/userApi";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  content: string;
  onClick: () => void;
}

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const { isLoading, user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();


  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");

    const checking = async () => {
      try {
        const check = await checkBlock(token as string);
        console.log(check);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            if (error.response.status === 403) {
              toast.error("User is blocked");
              localStorage.removeItem("userAccessToken");
              router.push("/login");
            }
          } else {
            toast.error("An unexpected error occurred in login");
          }
        } else {
          toast.error("An error occurred during login. Please try again.");
        }
      }
    };

    checking();
  }, []);

  if (isLoading) return <LoadingPage />;
  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    icon,
    content,
    onClick,
  }) => (
    <div
      className="bg-gray-800 p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-700 transition-colors duration-200"
      onClick={onClick}
    >
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-xl font-semibold ml-2">{title}</h3>
      </div>
      <p className="text-gray-300">{content}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <header className="bg-transparent shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-yellow-400">VerboFly</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/profile")}
              className="relative w-10 h-10 rounded-full overflow-hidden"
            >
              {user.user?.profilePhoto ? (
                <Image
                  src={user.user.profilePhoto}
                  alt="Profile"
                  layout="fill"
                  objectFit="cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <FaUser className="text-gray-400" />
                </div>
              )}
            </button>
            <button
              className="text-red-400 hover:text-red-300"
              onClick={handleOpenModal}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between mb-4">
          <h2 className="text-3xl font-bold mb-8">Dashboard</h2>
          <button className="border border-gray-100 rounded-2xl text-yellow-400 h-7 px-3 hover:text-black hover:bg-yellow-400 cursor-pointer hover:border-transparent"
          onClick={()=>router.push('/translate')}
          >
            Quick Translate
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            title="Lessons"
            icon={<FaBook className="text-purple-400" size={24} />}
            content="Continue your language learning journey"
            onClick={() => router.push("/lesson")}
          />
          <DashboardCard
            title="Connections"
            icon={<FaUsers className="text-green-400" size={24} />}
            content="Connect with other language learners"
            onClick={() => router.push("/connect")}
          />
          <DashboardCard
            title="Quizzes"
            icon={<FaQuestionCircle className="text-blue-400" size={24} />}
            content="Test your knowledge with interactive quizzes"
            onClick={() => router.push("/quiz")}
          />
          <DashboardCard
            title="Progress"
            icon={<GiProgression className="text-yellow-400" size={24} />}
            content="Track your learning progress"
            onClick={() => router.push("/progress")}
          />
          <DashboardCard
            title="Chats"
            icon={<IoMdChatboxes className="text-pink-400" size={24} />}
            content="Practice with language partners"
            onClick={() => router.push("/connect/[userId]")}
          />
          <DashboardCard
            title="Subscription"
            icon={<MdPayment className="text-cyan-400" size={24} />}
            content="Manage your VerboFly subscription"
            onClick={() => router.push("/subscription")}
          />
        </div>
      </main>

      {showModal && (
        <Modal
          onClose={handleCloseModal}
          title="Are you sure you want to logout?"
        >
          <div className="flex justify-between mt-4">
            <button
              onClick={logout}
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded-xl text-white transition-colors duration-200"
            >
              Yes
            </button>
            <button
              onClick={handleCloseModal}
              className="bg-red-600 hover:bg-red-700 p-2 rounded-xl text-white transition-colors duration-200"
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
    </div>
  );
};

export default ProtectedRoute(Dashboard);
