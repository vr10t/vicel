/* eslint-disable jsx-a11y/anchor-is-valid */
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { FaBars } from "@react-icons/all-files/fa/FaBars";
import { useRouter } from "next/router";
import { FaAngleDown } from "@react-icons/all-files/fa/FaAngleDown";
import { FaPhoneAlt } from "@react-icons/all-files/fa/FaPhoneAlt";
import { Toaster } from "react-hot-toast";
import { debounce, throttle } from "throttle-debounce";
import Image from "next/image";
import { Session } from "@supabase/supabase-js";
import { Text } from "@nextui-org/react";
import Profile from "../Account/Profile";
import userStore from "../../store/user";
import { supabase } from "../../utils/supabaseClient";

function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const { user, isLoading, getSession, logout } = userStore();
  const [sbSession, setSbSession] = useState<Session | string | null>(
    "session"
  );
  const triggerRef = useRef(null);
  const fetchSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSbSession(session);
  };
  useEffect(() => {
    fetchSession();
    const sess = throttle(2000, getSession);
    supabase.auth.onAuthStateChange((e) => {
      sess();
    });
    if (sbSession) {
      sess();
    }
    if (!isLoading && !sbSession) {
      logout();
    }
  }, []);
  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => {
    setShouldRender(true);
  }, []);

  const firstName =
    user?.user_metadata?.first_name ?? user?.profile?.first_name;
  const lastName = user?.user_metadata?.last_name ?? user?.profile?.last_name;
  const fullName = user?.user_metadata?.full_name;
  function handleClick() {
    setExpanded(!expanded);
  }

  return (
    <header className="shadow-sm">
      <div className="max-w-screen  items-center   flex fixed bg-gray-50 backdrop-blur-sm shadow w-screen !z-[999] ">
        <div className="flex items-center justify-between w-full h-20 p-4 mr-4 lg:gap-10">
          <Link href="/">
            <a className="flex items-center">
              <Image
                className="mt-4"
                src="/logo.png"
                width={89.7}
                height={29.4}
                alt="logo"
              />
            </a>
          </Link>
          <Link href="tel:01442250000">
            <a className="flex items-center self-center md:hidden ">
              <FaPhoneAlt className="mr-2" />
              <p className="align-middle break-keep">
                +44 1442 250 000
              </p>
            </a>
          </Link>
          <Toaster />

          <nav className="self-center justify-center hidden text-xl  text-gray-900 gap-2 lg:text-xl md:flex grow">
            <Link href="/">
              <a className="self-center block px-5 py-1 no-underline rounded-full hover:text-white hover:bg-blue-600 lg:px-8 duration-200 ">
                Home
              </a>
            </Link>
            <Link href="/about">
              <a className="self-center block px-5 py-1 no-underline rounded-full hover:text-white hover:bg-blue-600 lg:px-8 duration-200">
                About
              </a>
            </Link>
            <Link href="/#FAQ">
              <a className="self-center block px-5 py-1 no-underline rounded-full hover:text-white hover:bg-blue-600 lg:px-8 duration-200">
                FAQ
              </a>
            </Link>
            <Link href="/#contact">
              <a className="self-center block px-5 py-1 no-underline rounded-full hover:text-white hover:bg-blue-600 lg:px-8 duration-200">
                Contact
              </a>
            </Link>
          </nav>

          {shouldRender &&
            (user ? (
              <div className="hidden w-16 h-16 md:flex">
                <Profile />
              </div>
            ) : (
              <div className="justify-end hidden mr-4 space-x-4 md:flex">
                <Link href="tel:01442250000">
                  <a className="flex items-center self-center lg:text-xl ">
                    <FaPhoneAlt className="mr-2" />
                    <p className="align-middle break-keep">
                      +44 1442 250 000
                    </p>
                  </a>
                </Link>
                <Link href={`/sign-in?referrer=${router.asPath}`}>
                  <a className="flex md:hidden lg:flex items-center justify-center px-2 py-1 text-xl  text-gray-900 no-underline rounded-full min-w-max lg:px-8 hover:text-gray-50 hover:bg-gray-600 duration-200">
                    Log in
                  </a>
                </Link>
                <Link href={`/sign-up?referrer=${router.asPath}`}>
                  <a className="flex md:hidden lg:flex self-center px-5 py-1 text-xl  text-white no-underline rounded-full shadow-md min-w-max bg-blue-600 lg:text-xl hover:bg-gray-600 duration-200">
                    Sign up
                  </a>
                </Link>
              </div>
            ))}

          <div className="md:hidden">
            <button
              ref={triggerRef}
              onClick={handleClick}
              className="p-2 text-gray-900 rounded-lg bg-gray-50"
              type="button"
            >
              <span className="sr-only">Open menu</span>
              <FaBars />
            </button>
          </div>
        </div>
        {expanded && (
          <nav
            // ref={navRef}
            className="md:hidden flex flex-col gap-2 pt-2 shadow w-3/4 h-screen items-start pr-2 right-0 top-20 pl-4 fixed bg-gray-50   z-[23]"
          >
            <Link href="/#">
              <a className="block w-full px-3 py-2 text-xl  text-gray-900 no-underline rounded-md hover:text-blue-600 ">
                Home
              </a>
            </Link>
            <Link href="/about">
              <a className="block w-full px-3 py-2 text-xl  text-gray-900 no-underline rounded-md hover:text-blue-600 ">
                About
              </a>
            </Link>
            <Link href="/#FAQ">
              <a className="block w-full px-3 py-2 text-xl  text-gray-900 no-underline rounded-md hover:text-blue-600 ">
                FAQ
              </a>
            </Link>
            <Link href="/#contact">
              <a className="block w-full px-3 py-2 text-xl  text-gray-900 no-underline rounded-md hover:text-blue-600 ">
                Contact
              </a>
            </Link>
            {shouldRender &&
              (user ? (
                <div className="flex flex-col w-full">
                  <details className="list-disc text-red-50 marker:hidden">
                    <summary className="flex justify-between w-full px-3 py-2 mb-2 text-xl  text-gray-900 list-none cursor-pointer hover:text-blue-600 hover:rounded-md">
                      {fullName || `${firstName} ${lastName}`}{" "}
                      <FaAngleDown
                        aria-hidden
                        className="z-0 self-center pr-2 mr-2"
                      />
                    </summary>
                    <span className="w-full   h-[1px]  self-center bg-black/20" />
                    <div className="flex flex-col gap-2">
                      <Link href="/my-account">
                        <a className="flex justify-start px-3 py-1 text-lg  text-gray-900 cursor-pointer peer hover:rounded-md ">
                          My account
                        </a>
                      </Link>
                      <Link href="/my-account/bookings">
                        <a className="flex justify-start px-3 py-1 text-lg  text-gray-900 cursor-pointer peer hover:rounded-md ">
                          My bookings
                        </a>
                      </Link>
                    </div>
                  </details>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                    className="flex flex-col items-start px-3 py-2 text-xl  text-red-600 cursor-pointer hover:text-red-500 group peer hover:rounded-md "
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex justify-center w-full gap-6">
                  <Link href="/sign-in">
                    <a className="self-center block px-4 py-2 text-xl  text-gray-900 no-underline rounded-md hover:text-blue-600 ">
                      Sign in
                    </a>
                  </Link>
                  <div className="flex">
                    <Link href="/sign-up">
                      <a className="btn lg">
                        Sign up
                      </a>
                    </Link>
                  </div>
                </div>
              ))}
          </nav>
        )}
      </div>
    </header>
  );
}
export default React.memo(Navbar);
