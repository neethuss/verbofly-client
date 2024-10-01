"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import useAdminAuthStore from "@/store/adminAuthStore";
import Modal from "./Modal";
import dashboard from "../../public/asset/dashboard.png";
import user from "../../public/asset/user.png";
import language from "../../public/asset/language.webp";
import lesson from "../../public/asset/lesson.png";
import report from "../../public/asset/report.png";
import { FaLanguage, FaTimes, FaUserCog } from "react-icons/fa";
import { RiLogoutCircleLine } from "react-icons/ri";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdCategory, MdLanguage, MdPlayLesson, MdQuiz } from "react-icons/md";

interface AdminSidebarProps {
  onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose }) => {
  const [showModal, setShowModal] = React.useState(false);
  const { adminLogout } = useAdminAuthStore();
  const pathname = usePathname();

  const currentLink = (path: string) =>
    pathname === path ? "bg-blue-600" : "";

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 p-4 md:pt-8 pt-28 relative font-sans">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white md:hidden"
        >
          <FaTimes size={24} />
        </button>
      )}
      <nav className="flex-grow overflow-y-auto">
        <ul className="space-y-2">
          {[
            {
              href: "/admin/dashboard",
              icon: LuLayoutDashboard,
              text: "Dashboard",
            },
            {
              href: "/admin/userManagement",
              icon: FaUserCog,
              text: "User Management",
            },
            {
              href: "/admin/countryManagement",
              icon: MdLanguage,
              text: "Country Management",
            },
            {
              href: "/admin/languageManagement",
              icon: FaLanguage,
              text: "Language Management",
            },
            {
              href: "/admin/categoryManagement",
              icon:MdCategory,
              text: "Category Management",
            },
            {
              href: "/admin/lessonManagement",
              icon:MdPlayLesson,
              text: "Lesson Management",
            },
            {
              href: "/admin/quizManagement",
              icon:MdQuiz,
              text: "Quiz Management",
            },
          ].map((item, index) => (
            <li key={index}>
              <Link href={item.href} onClick={handleLinkClick}>
                <div
                  className={`flex items-center space-x-2 ${currentLink(
                    item.href
                  )} p-2 rounded-md`}
                >
                  <item.icon className="text-white" size={20} />
                  <p className="text-white text-center text-sm">{item.text}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <button onClick={handleOpenModal} className="w-full">
          <div className={`flex items-center space-x-2 p-2 rounded-md`}>
            <RiLogoutCircleLine className="text-rose-600" />
            <p className="text-white">Logout</p>
          </div>
        </button>
      </div>

      {showModal && (
        <Modal
          onClose={handleCloseModal}
          title="Are you sure you want to logout?"
        >
          <div className="flex justify-between">
            <button
              type="button"
              onClick={adminLogout}
              className="bg-blue-600 p-2 rounded-xl"
            >
              Yes
            </button>
            <button
              onClick={handleCloseModal}
              className="bg-red-600 p-2 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default React.memo(AdminSidebar);
