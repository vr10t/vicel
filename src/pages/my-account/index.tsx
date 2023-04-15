/* eslint-disable jsx-a11y/anchor-is-valid */
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "../../components/Account/Sidebar";
import Layout from "../../components/Layout";
import userStore from "../../store/user";

// const fetcher = (id) => fetch(id).then((res) => res.json() )
export default function MyAccount() {
  const { user, isLoading } = userStore();
  const user_id = "";
  // session?.user.id;


  const [edit, setEdit] = useState(false);

  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const firstName = user?.profile?.first_name ?? user?.user_metadata?.first_name;
  const lastName = user?.profile?.last_name ?? user?.user_metadata?.last_name;
  const fullName = user?.user_metadata.full_name ?? `${firstName} ${lastName}`;
  const initial = firstName?.slice(0, 1);
  const profilePic = user?.user_metadata.avatar_url ? (
    <Image
      className="object-fill rounded-full -z-20"
      src={user?.user_metadata.avatar_url || "/"}
      width={128}
      height={128}
      alt="profile pic"
    />
  ) : null;

  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in");
    }
  }, []);

  return (
    <Layout title={`My Account `}>
      {" "}
      <Sidebar />
      <div className="relative z-20 flex">
        <div className="flex flex-col items-center w-full min-h-screen gap-4 pt-10 bg-gray-50 -z-20">
          <div className="flex items-center justify-center w-32 h-32 pb-2 text-5xl font-medium rounded-full select-none text-black/80">
            {profilePic ?? initial}
          </div>{" "}
          <div className=" group ring-0 py-4 px-10 z-[21] rounded-lg  ring-black/40 flex flex-col items-center">
            <p className="">{fullName}</p>
            <p className="">{user?.email}</p>
            <p className="">{user?.phone}</p>
          </div>
          <div>
            <Link href='/my-account/bookings'>
              <a className='text-lg font-semibold text-gray-800 hover:text-blue-600 underline'>My Bookings</a>
            </Link>
          </div>
        </div>
      </div>{" "}
    </Layout>
  );
}
