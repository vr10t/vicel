/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable object-shorthand */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/jsx-no-bind */
import React, { useEffect, useState, SetStateAction, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import Image from "next/image";
import Modal from "react-modal";
import dayjs from "dayjs";
import { z } from "zod";
import { Spinner } from "@nextui-org/react";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import Layout from "../../components/Layout";
import Summary from "../../components/Booking/Summary";
import Service from "../../components/Booking/Service";
import FlightMonitoring from "../../components/Booking/FlightMonitoring";
import ContactDetails from "../../components/Booking/ContactDetails";
import SummaryLg from "../../components/Booking/SummaryLg";
import { bookingStore, secureStore } from "../../store/bookingStore";
import { trpc } from "../../utils/trpc";
import userStore from "../../store/user";
import { supabase } from "../../utils/supabaseClient";
import {
  MAX_PASSENGERS_STD,
  MAX_PASSENGERS_PC,
  MAX_PASSENGERS_MPV,
  MAX_LUGGAGE_MPV,
  MAX_LUGGAGE_STD,
  MAX_LUGGAGE_PC,
} from "../../../config";

export default function Booking() {
  const {
    location,
    destination,
    date,
    distance,
    flight_monitoring,
    passengers,
    service,
    setService,
    time,
    showSummary,
    setShowSummary,
    instructions,
    setInstructions,
    setDistance,
    setDuration,
  } = bookingStore();
  const {
    first_name,
    setFirstName,
    last_name,
    setLastName,
    setEmail,
    setPhone,
    email,
    phone,
    setUserId,
    setTotalTripPrice,
    total_trip_price,
    google,
  } = secureStore();
  const router = useRouter();
  const { user } = userStore();
  const [loading, setLoading] = useState(false);
  const termsRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [serviceSelected, setServiceSelected] = useState<string | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const getDistance = trpc.useMutation(["distance.get"], {
    onSuccess: async (data) => {
      if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
        setDistance(data.rows[0].elements[0].distance.text);
        return;
      }
      setDistance("error");
      setDuration("error");
    },
  });
  const getPrice = trpc.useQuery(
    [
      "price.get",
      {
        distance,
        service,
        date,
        time,
      },
    ],
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );
  useEffect(() => {
    if (user) {
      if (user.profile?.first_name) setFirstName(user.profile.first_name);
      if (user.profile?.last_name) setLastName(user.profile.last_name);
      if (user.phone) setPhone(user.phone);
      if (user.email) setEmail(user.email);

      setUserId(user.id);
    }
  }, [user]);
  useEffect(() => {
    setShowSummary(false);
  }, []);
  const { isLoading } = getPrice;
  useEffect(() => {
    setTotalTripPrice(getPrice.data?.price || total_trip_price || 0);
  }, [distance, service, date, time, isLoading]);
  useEffect(() => {
    setCanSubmit(false);
    if (
      location &&
      destination &&
      passengers &&
      date &&
      service &&
      total_trip_price &&
      first_name &&
      last_name &&
      email &&
      phone
    ) {
      try {
        // z.string().email().parse(email);
        setCanSubmit(true);
      } catch (error) {
        // toast.error("Please enter a valid email address")
      }
    }
  }, [
    location,
    destination,
    passengers,
    date,
    service,

    first_name,
    last_name,
    email,
    phone,
    total_trip_price,
  ]);

  useEffect(() => {
    setServiceSelected(service);
    if (!location || !destination) {
      setDistance("");
      setDuration("");
    }
  }, []);
  const handleSelectService = (e: any) => {
    const target = e.target as HTMLFormElement;
    if (target.id !== "") {
      setServiceSelected(target.id);
      setService((e.target as HTMLFormElement).id);
    }
    //
  };

  async function submitBoookingForUser() {
    if (getDistance.isLoading) {
      setTimeout(() => {
        submitBoookingForUser();
      }, 1000);
      return;
    }
    if (getDistance.isError) {
      toast.error("Error getting distance");
      setLoading(false);
      return;
    }
    router.push(
      `/booking/summary?first_name=${first_name}&last_name=${last_name}&email=${email}&phone=${phone} `,
      "/booking/summary"
    );
  }

  async function handleBooking() {
    getDistance.mutate({
      location,
      destination,
      dateTime: new Date(`${date} ${time}`),
    });

    toast.remove();
    const today = dayjs();
    const dateAndTime = dayjs(`${date} ${time}`);
    if (!dateAndTime.isAfter(today)) {
      toast.error("Please enter a valid date.");
      return;
    }

    if (parseFloat(distance) < 0.5 || distance.includes("ft")) {
      setShowSummary(false);
      toast.error(
        "Your trip is too short. Please enter a distance greater than 1 mile."
      );
      return;
    }
    //if distance is greater than 100 miles, return error.
    if (parseFloat(distance) > 100) {
      setShowSummary(false);
      toast.error(
        "Your trip is too long. Please enter a distance less than 100 miles."
      );
      return;
    }
    setLoading(true);
    if (user) {
      submitBoookingForUser();
      return;
    }
    setShowModal(true);
    setShowSummary(false);
    setLoading(false);
  }
  async function signInWithGoogle() {
    const {
      data: { provider },
      error,
    } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    setLoading(false);
  }

  useEffect(() => {
    setServiceSelected(service);
  }, [service]);

  const [pageLoading, setPageLoading] = useState(true);
  useEffect(() => {
    setPageLoading(false);
  }, []);

  if (pageLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );

  return (
    <>
      <Layout title={`Your booking `}>
        <div
          className={`${
            showSummary ? " lg:h-auto" : ""
          }static mt-10  justify-center lg:justify-start lg:pl-[5%] xl:pl-[20%]  w-[95vw] sm:w-[97vw] mx-auto  max-w-screen bg-gray-100  flex flex-col lg:flex-row  `}>
          {contentRef.current && (
            <Modal
              preventScroll
              appElement={contentRef.current}
              className="flex flex-col justify-center items-center min-h-screen z-[99]"
              isOpen={showModal}
              onRequestClose={() => setShowModal(false)}
              contentLabel="Sign In to continue.">
              <div className="w-5/6 p-6 shadow-lg rounded-xl bg-white md:w-1/2 sm:p-8 ">
                <button
                  type="button"
                  aria-label="Close Modal"
                  className="flex justify-end w-full px-4 py-2 text-4xl font-bold text-gray-800 rounded-full"
                  onClick={() => setShowModal(!showModal)}>
                  &times;
                </button>
                <span className="flex justify-center text-sm text-center text-gray-700 flex-items-center dark:text-gray-400">
                  Already have an account?{" "}
                  <Link href="/sign-in?referrer=/booking">
                    <a className="ml-1 text-sm text-blue-600 underline hover:text-blue-700">
                      Sign in
                    </a>
                  </Link>
                </span>
                <p className="label lg flex justify-center">
                  Create an account
                </p>
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="flex items-center justify-center mx-auto w-5/6 my-4 btn lg red">
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="mr-2"
                    viewBox="0 0 1792 1792"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M896 786h725q12 67 12 128 0 217-91 387.5t-259.5 266.5-386.5 96q-157 0-299-60.5t-245-193.5-193.5-245-60.5-299 60.5-299 193.5-245 245-193.5 299-60.5q300 0 515 201l-209 201q-123-119-306-119-129 0-238.5 65t-173.5 176.5-64 243.5 64 243.5 173.5 176.5 238.5 65q87 0 190-24t120-60 82-82 51.5-87 22.5-78h-436v-264z" />
                  </svg>
                  Google
                </button>

                <Link href="/sign-up?referrer=/booking">
                  <a className="flex items-center justify-center mx-auto w-5/6 my-4 btn lg">
                    Email
                  </a>
                </Link>
                <Link href="/booking/summary">
                  <a
                    type="submit"
                    className="flex justify-center mt-4 text-gray-800 underline text-md hover:text-blue-600">
                    No, thanks
                  </a>
                </Link>
              </div>
            </Modal>
          )}

          <div
            ref={contentRef}
            id="content"
            className="block max-w-full xs:px-4 sm:px-8 lg:w-[32rem]">
            <form
              onKeyDown={handleSelectService}
              onClick={handleSelectService}
              //eslint-disable-next-line
              role="listbox"
              aria-label="Service"
              className="">
              <div className="label lg">CHOOSE YOUR SERVICE</div>
              {passengers <= MAX_PASSENGERS_STD && (
                <Service
                  name="Standard Car"
                  htmlFor="Standard"
                  image={
                    <Image
                      src="/standard.webp"
                      width={1920}
                      height={1080}
                      alt="Standard"
                    />
                  }
                  passengers={MAX_PASSENGERS_STD.toString()}
                  luggage={MAX_LUGGAGE_STD.toString()}
                  selected={serviceSelected === "Standard"}>
                  <div className="flex flex-col items-center justify-center">
                    <p className="max-w-xs px-2 text-sm text-gray-600">
                      Saloon car with standard service. Includes up to{" "}
                      {MAX_PASSENGERS_STD}
                      passengers and {MAX_LUGGAGE_STD} luggage.
                    </p>
                  </div>
                </Service>
              )}

              {passengers <= MAX_PASSENGERS_PC && (
                <Service
                  name="People Carrier"
                  htmlFor="PC"
                  image={
                    <Image
                      src="/PC.webp"
                      width={800}
                      height={600}
                      alt="People Carrier"
                    />
                  }
                  passengers={MAX_PASSENGERS_PC.toString()}
                  luggage={MAX_LUGGAGE_PC.toString()}
                  selected={serviceSelected === "PC"}>
                  <div className="flex flex-col items-center justify-center">
                    <p className="max-w-xs px-2 text-sm text-gray-600">
                      Family size vehicle with premium service. Includes up to{" "}
                      {MAX_PASSENGERS_PC}
                      passengers and {MAX_LUGGAGE_PC} luggage.
                    </p>
                  </div>
                </Service>
              )}

              {passengers <= MAX_PASSENGERS_MPV && (
                <Service
                  name="MPV"
                  htmlFor="MPV"
                  image={
                    <Image
                      src="/MPV.webp"
                      width={1200}
                      height={960}
                      alt="MPV"
                    />
                  }
                  passengers={MAX_PASSENGERS_MPV.toString()}
                  luggage={MAX_LUGGAGE_MPV.toString()}
                  selected={serviceSelected === "MPV"}>
                  <div className="flex flex-col items-center justify-center">
                    <p className="max-w-xs px-2 text-sm text-gray-600">
                      Large vehicle suitable for groups. Includes up to{" "}
                      {MAX_PASSENGERS_MPV}
                      passengers and {MAX_LUGGAGE_MPV} luggage.
                    </p>
                  </div>
                </Service>
              )}
            </form>

            <section className="">
              <div className="flex items-stretch w-full font-medium tracking-wider  bg-gray-100">
                <p className="grow label lg"> PASSENGER DETAILS</p>
                {!user && (
                  <span className="flex self-center tracking-tight text-md gap-2">
                    <p> or </p>
                    <Link href="/sign-in?referrer=/booking">
                      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                      <a className="underline text-blue-700 hover:text-blue-600">
                        Sign In
                      </a>
                    </Link>
                  </span>
                )}
              </div>

              <div className="bg-gray-100 border-gray-400 shadow-sm px- lg:w-full ">
                <div className="flex items-center justify-between cursor-pointer">
                  <div className="w-full">
                    <ContactDetails />
                  </div>
                </div>
              </div>
            </section>
            {flight_monitoring && <FlightMonitoring />}
            <section className="">
              <div className="label mt-2">SPECIAL INSTRUCTIONS</div>
              <label htmlFor="instructions" className="">
                <textarea
                  aria-label="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-2 text-gray-900 border-0 rounded-lg shadow bg-gray-50"
                />{" "}
              </label>
            </section>
          </div>
          <div className="sticky hidden float-right lg:flex ">
            {google && (
              <SummaryLg
                onSubmit={handleBooking}
                disabled={!canSubmit || loading}
              />
            )}
          </div>
          {google && (
            <Summary
              loading={loading}
              onSubmit={handleBooking}
              disabled={!canSubmit || loading}
              hidden={showModal}
            />
          )}
        </div>
        <div className={`${"h-40"} `} />
      </Layout>
      <div className={`${"h-20 lg:h-0"} `} />
    </>
  );
}
