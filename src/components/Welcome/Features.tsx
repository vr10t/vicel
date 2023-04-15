/* eslint-disable jsx-a11y/anchor-is-valid */
/* This example requires Tailwind CSS v2.0+ */
import React from "react";
import { HiScale } from "@react-icons/all-files/hi/HiScale";
import { HiLightningBolt } from "@react-icons/all-files/hi/HiLightningBolt";
import { FaPlaneDeparture } from "@react-icons/all-files/fa/FaPlaneDeparture";
import { FaMoneyBillWave } from "@react-icons/all-files/fa/FaMoneyBillWave";
import Feature from "./Feature";

export default function Features() {
  return (
    <div className="py-12 bg-gray-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <p className="text-base text-blue-700 font-semibold tracking-wide uppercase">
            Our benefits
          </p>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
            Find out why people choose us
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-700 lg:mx-auto" />
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            <Feature
              name="Competitive rates "
              description=" We keep our prices fair and competitive with other services in the industry."
              icon={<FaMoneyBillWave />}
            />

            <Feature
              name="No hidden fees"
              description="The price we quote is the price you will pay, no matter how many stops you make on the way."
              icon={<HiScale />}
            />
            <Feature
              name="Quick response"
              description="We'll have you out in no time, so you won't be waiting too long for a taxi."
              icon={<HiLightningBolt />}
            />

            <Feature
              name="Airport transfer"
              description="Book your taxi today and we can pick you up from your airport and transport you to your destination."
              icon={<FaPlaneDeparture />}
            />
          </dl>
        </div>
      </div>
    </div>
  );
}
