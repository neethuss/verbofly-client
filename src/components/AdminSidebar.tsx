"use client"

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import useAdminAuthStore from "@/store/adminAuthStore";
import Modal from "./Modal";
import dashboard from "../../public/asset/dashboard.png";
import user from "../../public/asset/user.png";
import language from "../../public/asset/language.webp";
import lesson from '../../public/asset/lesson.png';
import report from '../../public/asset/report.png';
import { FaTimes } from 'react-icons/fa';

interface AdminSidebarProps {
  onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose }) => {
  const [showModal, setShowModal] = React.useState(false);
  const { adminLogout } = useAdminAuthStore();
  const pathname = usePathname();

  const currentLink = (path: string) => pathname === path ? "bg-blue-600" : '';

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:pt-4 pt-20 relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-white md:hidden"
        >
          <FaTimes size={24} />
        </button>
      )}
      <ul className="space-y-5">
        {[
          { href: "/admin/dashboard", src: dashboard, alt: "dashboard", text: "Dashboard" },
          { href: "/admin/userManagement", src: user, alt: "user", text: "User Management" },
          { href: "/admin/countryManagement", src: user, alt: "country", text: "Country Management" },
          { href: "/admin/languageManagement", src: language, alt: "language", text: "Language Management" },
          { href: "/admin/categoryManagement", src: language, alt: "category", text: "Category Management" },
          { href: "/admin/lessonManagement", src: lesson, alt: "lesson", text: "Lesson Management" },
          { href: "/admin/quizManagement", src: report, alt: "quiz", text: "Quiz Management" },
        ].map((item, index) => (
          <li key={index}>
            <Link href={item.href} onClick={handleLinkClick}>
              <div className={`flex items-center space-x-2 ${currentLink(item.href)} p-2 rounded-md`}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={20}
                  height={20}
                  className="filter invert"
                />
                <p className="text-white">{item.text}</p>
              </div>
            </Link>
          </li>
        ))}
        <li>
          <button onClick={handleOpenModal} className="w-full">
            <div className={`flex items-center space-x-2 p-2 rounded-md`}>
              <p className="text-white">Logout</p>
            </div>
          </button>
        </li>
      </ul>
      {showModal && (
        <Modal onClose={handleCloseModal} title="Are you sure you want to logout?">
          <div className="flex justify-between">
            <button type="button" onClick={adminLogout} className="bg-blue-600 p-2 rounded-xl">
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