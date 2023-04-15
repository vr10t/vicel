/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable camelcase */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { FaSquare } from "@react-icons/all-files/fa/FaSquare";
import { FaCircle } from "@react-icons/all-files/fa/FaCircle";

import dayjs from "dayjs";
import { Spinner, Tooltip } from "flowbite-react";
import { Toaster, toast } from "react-hot-toast";
import ReactModal from "react-modal";
import Stripe from "stripe";
import { supabase } from "../../../utils/supabaseClient";
import { formatAmountForDisplay } from "../../../utils/stripe-helpers";
import Sidebar from "../../../components/Account/Sidebar";
import Layout from "../../../components/Layout";
import { trpc } from "../../../utils/trpc";
import { Database } from "../../../../types/supabase";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

export default function handler() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [session, setSession] =
    useState<Stripe.Response<Stripe.Checkout.Session> | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [booking, setBooking] = useState<BookingRow>();

  const router = useRouter();
  const qid: string = router.query.id as string;
  const refund = trpc.useMutation(["stripe.refundPaymentIntent"]);
  const query = trpc.useMutation(["stripe.getCheckoutSession"], {
    onSuccess(data) {
      setSession(data);
    },
    onError(e) {
      console.log(e);
      setPaymentError("Something went wrong");
    },
  });
  async function getBooking() {
    const { data, error } = await supabase
      .from("bookings")
      .select()
      .eq("id", qid);
    if (data) {
      setBooking(data[0]);
      query.mutate({
        secret: data[0].secret!,
        checkout_session_id: data[0].checkout_session!,
      });
    }
  }

  if (booking) {
    //booking status is completed if booking date and time + booking 1 day has passed
    const isCompleted = dayjs(`${booking?.date} ${booking?.time}`)
      .add(1, "day")
      .isBefore(dayjs());
    if (isCompleted && booking?.status === "Confirmed") {
      booking.status = "Completed";
    }
  }
  useEffect(() => {
    if (qid) getBooking();
  }, [qid]);

  // eslint-disable-next-line prefer-template
  const date = dayjs(booking?.date || "" + booking?.time || "").format(
    "dddd, MMMM D, YYYY h:mm A"
  );

  useEffect(() => {
    setOrigin(booking?.location || "");
    setDestination(booking?.destination || "");
  }, [booking]);
  const total = formatAmountForDisplay(booking?.total, "GBP");
  async function updateBookingStatus(status: string) {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", qid);
    if (data) {
      setBooking(data[0]);
    }
  }
  async function handleCancelBooking() {
    // only allow cancelation if time left until booking date is greater than 5 hours
    if (dayjs().isBefore(dayjs(date).subtract(24, "hours"))) {
      updateBookingStatus("Cancelled");
      if (session) {
        // process refund
        refund.mutate(
          {
            secret: booking?.secret as string,
            paymentIntentId: session.payment_intent?.toString() || "",
          },
          {
            onSuccess(data) {
              toast.success("Booking canceled succesfully", {
                duration: 4000,
                position: "top-center",
              });
              router.push("/");
            },
            onError(e) {
              setIsOpen(false);
              // update booking status to pending
              updateBookingStatus("Pending");
            },
          }
        );
        return;
      }

      setIsOpen(false);
      toast.error("Something went wrong", {
        duration: 4000,
        position: "top-center",
      });
    } else {
      setIsOpen(false);
      toast.error("You can only cancel a booking 24 hours in advance", {
        duration: 4000,
        position: "top-center",
      });
    }
  }
  return (
    <Layout title={`Booking Details `}>
      <Sidebar id={qid} />
      <div className="flex">
        <ReactModal
          isOpen={isOpen}
          className="flex items-center justify-center h-64 px-4 mx-auto mt-40 align-middle bg-white rounded w-max ring-1 ring-black/20">
          <div className="flex flex-col items-center justify-center">
            Are you sure you want to cancel this booking?
            <div className="flex justify-between w-1/2 mt-4">
              <button
                type="button"
                className="text-gray-800"
                onClick={() => setIsOpen(false)}>
                Go back
              </button>
              <button
                type="button"
                className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                onClick={handleCancelBooking}>
                Cancel
              </button>
            </div>
          </div>
        </ReactModal>
        {booking ? (
          <div className="flex flex-col items-center w-full min-h-screen pt-10 gap-4 ">
            <div className="flex flex-col items-start w-11/12 h-full px-4 py-5 border-2 rounded-lg border-gray-700/10 max-w-screen-sm gap-2 bg-gray-50 ">
              <div className="flex justify-center w-full mt-2 mb-4 text-3xl font-light tracking-tight text-gray-800">
                Your booking details
              </div>

              <div className="flex items-start w-11/12 px-4 rounded-lg ">
                <div
                  className={`text-xl text-gray-800 font-semibold tracking-tight `}>
                  {booking.status === "Pending"
                    ? "Your booking is pending."
                    : `Your booking has been ${booking.status?.toLowerCase()}.`}
                </div>
              </div>
              <div className="flex justify-between w-full px-4 font-medium tracking-tight text-gray-900 text-md">
                {date}
              </div>
              <span className="bg-black/20 w-5/6 h-[1px] mx-auto my-1" />
              <div className="flex flex-col w-full px-4 py-4 bg-gray-100 rounded-lg">

                <div className="flex my-10 ">
                  <div className="flex flex-col pr-4 mt-2 h-5/6">
                    <FaCircle className="z-0 mt-2 text-blue-600">.</FaCircle>
                    <div className="self-center h-full border-l-4 border-dotted border-blue-700/20 border-" />
                    <FaSquare className="z-0 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xl font-medium tracking-tight text-gray-900">
                      {booking?.location}{" "}
                    </div>
                    <div className="text-sm font-normal tracking-normal text-gray-900">
                      {dayjs(date).format("h:mm A")}{" "}
                    </div>
                    <div className="mt-5 text-xl font-medium tracking-tight text-gray-900">
                      {booking?.destination}
                    </div>
                  </div>
                </div>
              </div>
              <span className="bg-black/20 w-5/6 h-[1px] mx-auto my-1" />

              <div className="flex justify-center w-full gap-4">
                <Tooltip
                  // eslint-disable-next-line react/style-prop-object
                  style="light"
                  className={`${
                    dayjs().isBefore(
                      dayjs(booking?.date + booking?.time).subtract(5, "hours")
                    )
                      ? "hidden"
                      : "flex"
                  }`}
                  content="You cannot cancel this booking.">
                  {" "}
                  {booking?.status !== "Cancelled" &&
                    booking?.status !== "Completed" && (
                      <button
                        type="button"
                        disabled={
                          !dayjs().isBefore(
                            dayjs(booking?.date + booking?.time).subtract(
                              5,
                              "hours"
                            )
                          )
                        }
                        onClick={() => setIsOpen(true)}
                        className="w-full px-4 py-2 my-4 text-lg bg-red-500 rounded-lg disabled:bg-gray-500 text-gray-50">
                        Cancel booking
                      </button>
                    )}
                </Tooltip>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center w-full mt-64">
            <Spinner size="xl" />
          </div>
        )}
      </div>{" "}
    </Layout>
  );
}
