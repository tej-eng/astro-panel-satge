"use client";
import Image from "next/image";
import { useGetExpertProfileDetailsQuery } from "@/app/redux/slice/profileApi";

import {
  IoIosNotificationsOutline,
  IoMdSettings,
  IoMdLogOut,
} from "react-icons/io";
import Link from "next/link";
import styles from "@/app/components/navbar/navbar.module.css";

import { useState } from "react";
import { CgProfile } from "react-icons/cg";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: expertData } = useGetExpertProfileDetailsQuery();
  const profileData = expertData?.profileData || {};
  const expertImageUrl =
    profileData?.image_path && profileData?.image
      ? `https://dhwaniastro.com/${profileData.image_path}${profileData.image}`
      : "/user2.png";

  const handleLogout = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    window.location.href = "/";
  };

  return (
    <div className={`${styles.container} flex items-center justify-center`}>
      <div className={styles.astrohead}>
        <div className="flex items-center justify-between w-full">
          <div className={`${styles.logoImage} flex items-center ml-[3rem]`}>
            <Image src="/logo.png" alt="loading..." width="120" height="50" />
          </div>

          <div
            className={`${styles.astronavlinks} flex items-center justify-center`}
          >
            <div className="flex items-center gap-2"></div>

            <div
              className="relative"
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
            >
              <div
                className={`text-white cursor-pointer mr-[1rem] opacity-100  ${styles.astroprofile}`}
              >
                <Image
                  src={expertImageUrl}
                  alt="profile"
                  width={35}
                  height={35}
                  className="w-12 h-12 rounded-full object-cover  border-white shadow-md"
                />
              </div>

              <div
                className={`absolute right-0   bg-white rounded-lg shadow-lg z-50 ${
                  isOpen ? "block" : "hidden"
                }`}
              >
                <ul className="py-2 text-sm text-gray-700">
                  <li>
                    <div className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                      <CgProfile className="text-gray-500" />

                      <Link
                        href="/dashboard/setting/profilesetting"
                        className=" "
                      >
                        Profile
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                      <IoMdSettings className="text-gray-500" />
                      <Link href="/dashboard/setting" className="block 0">
                        Settings
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 "
                    >
                      <IoMdLogOut className="text-gray-500" />
                      <button className="block  ">Signout</button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
