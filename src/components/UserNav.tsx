"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaTachometerAlt, FaBook, FaUsers, FaSignOutAlt } from "react-icons/fa";
import { GiProgression } from "react-icons/gi";
import { ImProfile } from "react-icons/im";
import { CiSquareQuestion } from "react-icons/ci";
import { MdPayment } from "react-icons/md";
import useAuthStore from "@/store/authStore";
import Modal from "./Modal";
import { userAgent } from "next/server";

const UserNav: React.FC = React.memo(() => {
  const [showModal, setShowModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { logout, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const NavItem: React.FC<{
    href: string;
    icon: React.ReactNode;
    label: string;
  }> = ({ href, icon, label }) => (
    <Link href={href} className="group relative flex flex-col items-center">
      <div className="p-2 rounded-full bg-gray-800 hover:bg-yellow-400 transition duration-300">
        {React.cloneElement(icon as React.ReactElement, {
          className: "text-yellow-400 group-hover:text-black",
          size: 20,
        })}
      </div>
      <span className="mt-1 text-xs text-white opacity-0 group-hover:opacity-100 transition duration-300">
        {label}
      </span>
    </Link>
  );

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-20 p-2 bg-gray-800 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <nav
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed top-0 left-0 h-full w-30 bg-gray-900 text-white transition-transform duration-300 ease-in-out z-10 overflow-y-auto`}
      >
        <div className="flex-shrink-0 p-4">
          <div className="flex items-center justify-center mb-8">
            <Link href="/">
              <Image
                src="/asset/verboflylogo.png"
                alt="VerboFly Logo"
                width={60}
                height={60}
              />
            </Link>
          </div>

          <div className="flex-grow overflow-y-auto">
            <div className="px-4 py-2 space-y-1">
              <NavItem
                href="/dashboard"
                icon={<FaTachometerAlt />}
                label="Dashboard"
              />
              <NavItem href="/lesson" icon={<FaBook />} label="Lessons" />
              <NavItem
                href="/progress"
                icon={<GiProgression />}
                label="Progress"
              />
              <NavItem href="/profile" icon={<ImProfile />} label="Profile" />
              <NavItem href="/connect" icon={<FaUsers />} label="Connections" />
              <NavItem
                href="/requests"
                icon={<CiSquareQuestion />}
                label="Requests"
              />
              <NavItem
                href="/subscription"
                icon={<MdPayment />}
                label="Subscription"
              />
            </div>
          </div>

          <div className="mt-auto">
            <button
              onClick={handleOpenModal}
              className="w-full flex items-center p-2 hover:bg-red-600 rounded-md transition duration-300"
            >
              <FaSignOutAlt className="mr-3 text-red-400" size={20} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {showModal && (
        <Modal
          onClose={handleCloseModal}
          title="Are you sure you want to logout?"
        >
          <div className="flex justify-between mt-4">
            <button
              onClick={logout}
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded-xl text-white"
            >
              Yes
            </button>
            <button
              onClick={handleCloseModal}
              className="bg-red-600 hover:bg-red-700 p-2 rounded-xl text-white"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </>
  );
});

export default UserNav;
