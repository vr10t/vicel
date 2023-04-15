/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/anchor-is-valid */
import Link from "next/link";
import React, { useRouter } from "next/router";
import { FaHome } from "@react-icons/all-files/fa/FaHome";
import { FaAngleRight } from "@react-icons/all-files/fa/FaAngleRight";

export default function Sidebar(props: { id?: string }) {
  const { id } = props;
  const router = useRouter();
  const path = router.pathname;
  const active = " text-blue-700 hover:text-blue-600";
  const inactive = "text-gray-800 hover:text-blue-600 ";
  const iconInactive = "text-gray8700 group-hover:text-blue-600";

  return (
    <div className=" py-4 z-[21] w-full">
      <nav className="flex overflow-auto">
        <span className="items-center flex group">
          <Link href="/">
            <a
              aria-label="account"
              className={`group relative flex   ${inactive}`}>
              <FaHome
                aria-hidden
                className={`z-0 ml-[0.1rem] self-center text-lg ${iconInactive} `}
              />
            </a>
          </Link>
          <FaAngleRight
            aria-hidden
            className={`z-0 ml-[0.1rem] self-center text-lg `}
          />
        </span>
        <span className="items-center flex">
          <Link href="/my-account">
            <a
              aria-label="account"
              className={`group relative flex items-center ${
                path === "/my-account" ? active : inactive
              }`}>
              <span className="font-medium tracking-tight">Account</span>
            </a>
          </Link>
        </span>
        <FaAngleRight
          aria-hidden
          className={`z-0 ml-[0.1rem] self-center text-lg `}
        />
        {path.includes("/my-account/bookings") && (
          <span className="items-center flex">
            <Link href="/my-account/bookings">
              <a
                aria-label="bookings"
                className={`group relative flex items-center  ${
                  path === "/my-account/bookings" ? active : inactive
                }`}>
                <span className="font-medium tracking-tight">Bookings</span>
              </a>
            </Link>
          </span>
        )}

        {path.length > 21 && (
          <span className="items-center flex">
            <p className={` relative flex items-center text-gray-700 `}>
              <FaAngleRight
                aria-hidden
                className={`z-0 ml-[0.1rem] self-center text-lg `}
              />
              <span className="font-medium tracking-tight">{id}</span>
            </p>
          </span>
        )}
      </nav>
    </div>
  );
}
