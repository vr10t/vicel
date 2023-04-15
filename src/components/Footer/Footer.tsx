/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

import { FaFacebook } from "@react-icons/all-files/fa/FaFacebook";
import { SiTrustpilot } from "@react-icons/all-files/si/SiTrustpilot";
import { SiNextdoor } from "@react-icons/all-files/si/SiNextdoor";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="text-center text-white bg-gradient-to-br from-zinc-800 to-zinc-800">
      <div className="p-4">
        <section className="text-center ">
          <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <div className="flex flex-col mb-4 ">
              <p className="text-xl font-light uppercase">Address</p>

              <p className="text-gray-50">Hemel Hempstead, Hertfordshire</p>
            </div>

            <div className="flex flex-col mb-4">
              <p className="text-xl font-light uppercase">Social</p>

              <section className="flex flex-col items-center justify-center mb-2 ">
                <Link href="https://www.facebook.com/profile.php?id=100088352692239">
                  <a
                    target="_blank"
                    aria-label="Facebook"
                    className="flex items-center float-left mx-2 mt-2 text-4xl gap-2 text-gray-50 hover:text-gray-200"
                  >
                    <FaFacebook className="z-0" />
                    <p className="text-base">Facebook</p>
                  </a>
                </Link>
              </section>
            </div>

            <div className="flex flex-col items-center mb-4">
              <div className="flex flex-col items-start">
                <p className="text-xl font-light uppercase">Review us on:</p>
                <Link href="https://uk.trustpilot.com/review/vicel.co.uk">
                  <a
                    target="_blank"
                    aria-label="Trustpilot"
                    className="flex items-center justify-start float-left mx-2 mt-2 text-4xl gap-2 text-gray-50 hover:text-gray-200"
                  >
                    <SiTrustpilot className="z-0" />
                    <p className="text-base">Trustpilot</p>
                  </a>
                </Link>
                <Link href="https://nextdoor.com/pages/vicel-airport-taxi-valley-head-wv">
                  <a
                    target="_blank"
                    aria-label="Nextdoor"
                    className="flex items-center float-left mx-2 mt-2 text-4xl gap-2 text-gray-50 hover:text-gray-200"
                  >
                    <SiNextdoor className="z-0" />
                    <p className="text-base">Nextdoor</p>
                  </a>
                </Link>
                <Link href="https://www.yell.com/biz/vicel-airport-taxis-hemel-hempstead-8439478/">
                  <a
                    target="_blank"
                    aria-label="Yell"
                    className="flex items-center justify-start float-left mx-2 mt-2 text-4xl gap-2 text-gray-50 hover:text-gray-200"
                  >
                    <Image
                      src="/yell.svg"
                      alt="Yell"
                      className="z-0"
                      width={40}
                      height={40}
                    />
                    <p className="text-base">Yell</p>
                  </a>
                </Link>
              </div>
            </div>

            <div className="flex flex-col mb-4">
              <p className="text-xl font-light uppercase">Contact</p>

              <ul className="mb-0 list-unstyled">
                <li>
                  <a
                    href="mailto:contact@vicel.co.uk"
                    className="text-gray-50 hover:text-gray-200"
                  >
                    Email Address
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col mb-4">
              <p className="text-xl font-light uppercase">Useful Links</p>

              <ul className="flex flex-col mb-0 list-unstyled gap-2">
                <li>
                  <Link href="/terms">
                    <a className="text-gray-50 hover:text-gray-200">
                      Terms of Service{" "}
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy">
                    <a className="text-gray-50 hover:text-gray-200">
                      Privacy Policy
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/#FAQ">
                    <a className="text-gray-50 hover:text-gray-200">FAQ</a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <div
        className="flex flex-col p-3 text-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
      >
        Copyright © {new Date().getFullYear()} Vicel Ltd. All rights reserved.
        {/*
        <Link href="https://unrx.dev">
        <a
          target="_blank"
          className="flex items-center justify-center text-gray-50 hover:text-gray-100 gap-2"
        >
          {" "}
          Site by
          <Image src="/unrx.svg" alt="unrx" width={80} height={30} />
        </a>
      </Link>
    */}
      </div>
    </footer>
  );
}
