"use client"

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminProtectedRoute from "@/HOC/AdminProtectedRoute";
import { FaUsers } from "react-icons/fa6";
import { RiUserStarLine } from "react-icons/ri";
import { MdFeaturedPlayList } from "react-icons/md";
import { fetchUsers } from "@/services/userApi";

interface Country {
  countryName: string;
}

interface Language {
  languageName: string;
  countries: Country[];
}

interface User {
  _id: string;
  username: string;
  email: string;
  profilePhoto: string;
  country: Country;
  nativeLanguage: Language;
  knownLanguages: Language[];
  languagesToLearn: Language[];
  bio: string;
  connections: string[];
  sentRequests: string[];
  receivedRequests: string[];
  isSubscribed: boolean;
  expiryDate: Date;
  createdAt: Date
}

const page = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [subscribedUsers, setSubscribedUsers] = useState(0);
  const [groupedUsers, setGroupedUsers] = useState<Record<string, { users: User[]; subscribedCount: number }>>({});

  useEffect(() => {
    const token = localStorage.getItem("adminAccessToken");
    const fetchUsersData = async () => {
      try {
        const data = await fetchUsers(token as string);
        console.log(data.users, "iser");
        setTotalUsers(data.total);

        const users = data.users;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfToday = today;
        const endOfToday = new Date(today);
        endOfToday.setDate(startOfToday.getDate() + 1);
        const usersCreatedToday = users.filter(
          (user:User) => {
            const createdAt = new Date(user.createdAt);
            return createdAt >= startOfToday && createdAt < endOfToday;
          }
        );
        setNewUsers(usersCreatedToday.length);

        const subscribedUsers = users.filter((user:User) => user.isSubscribed);
        setSubscribedUsers(subscribedUsers.length);

        const grouped = groupUsersByNativeLanguage(data.users);
        setGroupedUsers(grouped);
      } catch (error) {
        console.error("Error fetching user details in dashboard:", error);
      }
    };
    fetchUsersData();
  }, []);

  const groupUsersByNativeLanguage = (
    users: User[]
  ): Record<string, { users: User[]; subscribedCount: number }> => {
    return users.reduce((acc, user) => {
      const language = user.nativeLanguage.languageName;
      if (!acc[language]) {
        acc[language] = { users: [], subscribedCount: 0 };
      }
      acc[language].users.push(user);
      if (user.isSubscribed) {
        acc[language].subscribedCount++;
      }
      return acc;
    }, {} as Record<string, { users: User[]; subscribedCount: number }>);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#0f172a] p-4 sm:p-6 text-white">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search here..."
            className="w-full p-2 sm:p-3 rounded-lg bg-[#1e293b] text-white placeholder-gray-400"
          />
        </div>

       
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
          <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1e293b] p-2 sm:p-4 rounded-lg flex items-center h-32">
              <div>
                <FaUsers className="w-8 h-8 sm:w-10 sm:h-10" />
                <p className="text-base sm:text-lg font-semibold mt-2">Total Users</p>
                <p className="text-xl sm:text-2xl font-bold">{totalUsers}</p>
              </div>
            </div>
            <div className="bg-[#1e293b] p-4 rounded-lg flex items-center h-32">
              <div>
                <RiUserStarLine className="w-8 h-8 sm:w-10 sm:h-10" />
                <p className="text-base sm:text-lg font-semibold mt-2">New Users</p>
                <p className="text-xl sm:text-2xl font-bold">{newUsers}</p>
              </div>
            </div>
            <div className="bg-[#1e293b] p-4 rounded-lg flex items-center h-32">
              <div>
                <MdFeaturedPlayList className="w-8 h-8 sm:w-10 sm:h-10" />
                <p className="text-base sm:text-lg font-semibold mt-2">Active Subscription</p>
                <p className="text-xl sm:text-2xl font-bold">{subscribedUsers}</p>
              </div>
            </div>
          </div>
        </div>

      
        <div className="bg-[#1e293b] p-4 sm:p-6 rounded-lg">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
            Current users in different native languages
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-sm sm:text-base mx-auto">
              <thead className="bg-[#2d3748]">
                <tr>
                  <th className="py-2 px-3 sm:py-3 sm:px-6">#</th>
                  <th className="py-2 px-3 sm:py-3 sm:px-6">Native Language</th>
                  <th className="py-2 px-3 sm:py-3 sm:px-6">Users</th>
                  <th className="py-2 px-3 sm:py-3 sm:px-6">Subscriptions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedUsers).map(([languageName, { users, subscribedCount }]) => (
                  <tr key={languageName} className="border-t border-[#374151]">
                    <td className="py-2 px-3 sm:py-3 sm:px-6">1</td>
                    <td className="py-2 px-3 sm:py-3 sm:px-6">{languageName}</td>
                    <td className="py-2 px-3 sm:py-3 sm:px-6">{users.length}</td>
                    <td className="py-2 px-3 sm:py-3 sm:px-6">{subscribedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProtectedRoute(page);
