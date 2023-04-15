/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import userStore from "../../store/user";

export default function Profile() {
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const { user, logout } = userStore();
  // const user_id = session?.user.id

  const firstName =
    user?.user_metadata?.first_name ?? user?.profile?.first_name;
  const lastName = user?.user_metadata?.last_name ?? user?.profile?.last_name;
  const fullName = user?.user_metadata?.full_name;
  const initial =
    user?.profile?.first_name?.slice(0, 1).toUpperCase() ??
    user?.user_metadata?.first_name?.slice(0, 1).toUpperCase();
  const profilePic = user?.user_metadata?.avatar_url ? (
    <Image
      className="object-fill rounded-full -z-20"
      src={user?.user_metadata?.avatar_url}
      width={64}
      height={64}
      alt="profile pic"
    />
  ) : null;
  function getRandomColor(name: string) {
    if (!name) return;
    const firstAlphabet = name.toLowerCase();
    // get the ASCII code of the character
    const asciiCode1 = firstAlphabet.charCodeAt(0);
    const asciiCode2 = firstAlphabet.charCodeAt(1);
    const asciiCode3 = firstAlphabet.charCodeAt(2);

    // number that contains 3 times ASCII value of character -- unique for every alphabet
    const colorNum =
      asciiCode1.toString() + asciiCode2.toString() + asciiCode3.toString();

    const num = Math.round(0xffffff * parseInt(colorNum, 10));
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    // eslint-disable-next-line consistent-return
    return `rgb(${r}, ${g}, ${b})`;
  }
  const color = getRandomColor(firstName);

  return (
    <>
      {profilePic ? (
        <button
          type="button"
          ref={menuRef}
          onClick={toggle}
          className="select-none   rounded-full h-16 w-16 flex justify-center items-center   cursor-pointer ">
          <span className="z-0">{profilePic}</span>
        </button>
      ) : (
        <button
          type="button"
          ref={menuRef}
          style={{ backgroundColor: color }}
          onClick={toggle}
          className="select-none  rounded-full h-16 w-16 flex justify-center items-center  text-white font-medium cursor-pointer text-3xl">
          <span className="z-0">{initial}</span>
        </button>
      )}
      <div
        // hidden={isOpen}
        className={`${
          isOpen ? "flex" : "hidden"
        } shadow-md flex-col gap-2 absolute px-2 py-4 right-4 rounded-lg bg-gray-50 top-[5.2rem]`}>
        <div className="flex flex-col group justify-start px-4 text-lg  font-medium text-gray-900  hover:rounded-md">
          {fullName || `${firstName} ${lastName}`}
          <span className="w-5/6  h-[1px] mt-2 self-center bg-black/20" />
        </div>

        <Link href="/my-account">
          <a className="flex justify-start px-3 text-lg font-light text-gray-900 cursor-pointer peer hover:rounded-md hover:text-sky-500">
            My account
          </a>
        </Link>
        <Link href="/my-account/bookings">
          <a className="flex justify-start px-3 mb-2 text-lg font-light text-gray-900 cursor-pointer peer hover:rounded-md hover:text-sky-500">
            My bookings
          </a>
        </Link>

        <button
          type="button"
          onClick={() => logout()}
          className="flex flex-col group items-start px-4 font-light text-lg text-red-500 cursor-pointer peer hover:rounded-md  hover:text-red-400">
          Sign Out
        </button>
      </div>
    </>
  );
}
