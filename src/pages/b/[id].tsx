/* eslint-disable consistent-return */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable camelcase */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { FaSquare } from "@react-icons/all-files/fa/FaSquare";
import { FaCircle } from "@react-icons/all-files/fa/FaCircle";
import dayjs from "dayjs";
import { Spinner, Tooltip } from "flowbite-react";
import { toast } from "react-hot-toast";
import ReactModal from "react-modal";
import { formatAmountForDisplay } from "../../utils/stripe-helpers";
import Layout from "../../components/Layout";
import { trpc } from "../../utils/trpc";
import { Database } from '../../../types/supabase';

type BookingRow = Database['public']['Tables']['bookings']['Row']

export type Booking = {
  checkout_session: string;
  id: string;
  created_at: string;
  location: string;
  destination: string;
  date: string;
  passengers: number;
  distance: string;
  service: string;
  return_date: string;
  flight_number: string;
  first_name: string;
  email: string;
  phone: string;
  last_name: string;
  time: string;
  return_time: string;
  luggage: string;
  return_luggage: string;
  plane_arriving_from: string;
  airline_name: string;
  return_first_name: string;
  return_email: string;
  return_phone: string;
  return_service: string;
  return_last_name: string;
  return_passengers: string;
  return_location: string;
  return_destination: string;
  user_id: string;
  total: string;
  status: string;
  payment: string;
  secret: string;
};
export default function handler() {
  const [loading, setLoading] = useState<boolean>(false);
  const [e, setError] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [session, setSession] = useState<any>();
  const [paymentError, setPaymentError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  let innerWidth;
  useEffect(() => {
    innerWidth = window.innerWidth;
  }, [globalThis]);
  const [booking, setBooking] = useState<BookingRow>();

  const router = useRouter();
  const qid: string = router.query.id as string;
  const qsid: string = router.query.sid as string;

  const query = trpc.useMutation(["stripe.getCheckoutSession"], {
    onSuccess(data) {
      setSession(data);
    },
    onError() {
      setPaymentError("Something went wrong");
    },
  });

  useEffect(() => {
    if (booking?.checkout_session) {
      query.mutate({
        checkout_session_id: booking?.checkout_session,
        secret: qsid,
      });
    }
  }, [booking, qsid]);
  async function handleError() {
    setIsOpen(false);
    // update booking status to pending
    try {
      const pending = await fetch("/api/update-booking-id", {
        body: JSON.stringify({
          id: qid,
          query: { status: "Pending" },
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const { data: pendingData, error: pendingError } = await pending.json();
    } catch (err) {
      toast.error("Something went wrong", {
        duration: 4000,
        position: "top-center",
      });
    }
  }
  const processRefund = trpc.useMutation(["stripe.refundPaymentIntent"], {
    onSuccess() {
      toast.success("Booking canceled succesfully", {
        duration: 4000,
        position: "top-center",
      });
      router.push("/");
    },
    onError(error) {
      handleError();
      toast.error(error.message);
    },
  });
  const getSecret = trpc.useQuery(["bookings.verify", { secret: qsid }], {
    onSuccess(data) {
      if (Array.isArray(data) && data.length > 0) {
        setBooking(data[0]);
        setLoading(false);
      } else {
        setError(true);
        setLoading(false);
      }
    },
    onError() {
      setError(true);
      setLoading(false);
    },
  });

  useEffect(() => {
    setLoading(true);
  }, [qid, qsid]);

  if (booking) {
    //calculate booking duration based on distance
    //booking status is completed if booking date and time + booking duration is past
    const isCompleted = dayjs(`${booking?.date} ${booking?.time}`)
      .add(1, "day")
      .isBefore(dayjs());
    if (isCompleted && booking?.status === "Confirmed") {
      booking.status = "Completed";
    }
  }

  // eslint-disable-next-line prefer-template
  const date = dayjs(booking?.date || "" + booking?.time || "").format(
    "dddd, MMMM D, YYYY h:mm A"
  );

  useEffect(() => {
    setOrigin(booking?.location || "");
    setDestination(booking?.destination || "");
  }, [booking]);
  const total = formatAmountForDisplay(booking?.total, "GBP");
  async function handleCancelBooking() {
    // only allow cancelation if time left until booking date is greater than 5 hours
    if (dayjs().isBefore(dayjs(date).subtract(24, "hours"))) {
      const res = await fetch("/api/update-booking-id", {
        body: JSON.stringify({
          secret: qsid,
          id: qid,
          query: { status: "Cancelled" },
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = await res.json();
      if (data.length > 0 && session) {
        // process refund
        processRefund.mutate({
          paymentIntentId: session.payment_intent,
          secret: qsid,
        });
      } else {
        setIsOpen(false);
        toast.error("Something went wrong", {
          duration: 4000,
          position: "top-center",
        });
      }
    } else {
      setIsOpen(false);
      toast.error("You can only cancel a booking 24 hours in advance", {
        duration: 4000,
        position: "top-center",
      });
    }
  }
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  if (e)
    return (
      <h1 className="flex items-center justify-center h-screen">
        Booking not found.
      </h1>
    );
  return (
    <Layout title={`Booking Details `}>
      <div className="flex">
        <ReactModal
          isOpen={isOpen}
          className="flex items-center justify-center w-full h-64 px-4 mx-auto mt-40 align-middle bg-white rounded ring-1 ring-black/20"
        >
          <div className="flex flex-col items-center justify-center">
            <p>Are you sure you want to cancel this booking?</p>
            <p className="text-sm text-gray-500">
              {/* warn user about cancellation fee */}
              You may be charged a cancellation fee.
            </p>
            <div className="flex justify-between w-1/2 mt-4">
              <button
                type="button"
                className="text-gray-800"
                onClick={() => setIsOpen(false)}
              >
                Go back
              </button>
              <button
                type="button"
                className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                onClick={handleCancelBooking}
              >
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
                  className={`text-xl text-gray-800 font-semibold tracking-tight `}
                >
                  {booking.status === "Pending"
                    ? "Your booking is pending."
                    : `Your booking has been ${booking.status!.toLowerCase()}.`}
                </div>
              </div>
              <div className="flex justify-between w-full px-4 font-medium tracking-tight text-gray-900 text-md">
                {date}
              </div>
              <span className="bg-black/20 w-5/6 h-[1px] mx-auto my-1" />
              <div className="flex flex-col w-full px-4 py-4 bg-gray-100 rounded-lg">
                {/* {innerWidth &&  <Map
              width="100%"
              //make height 100px on small screens and 200px on large screens
              height={innerWidth > 768 ? '200px' : '100px'}
             
              
            origin={origin}
            destination={destination}
            shouldFetchDirections />} */}

                <div className="flex my-10 ">
                  <div className="flex flex-col pr-4 mt-2 h-5/6">
                    <FaCircle className="z-0 mt-2 text-sky-500">.</FaCircle>
                    <div className="self-center h-full border-l-4 border-dotted border-sky-600/20 border-" />
                    <FaSquare className="z-0 text-sky-500" />
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
              {/* {booking?.checkout_session && (
                <div className="flex flex-col items-start w-full px-4 py-4 bg-gray-100 rounded-lg">
                  <p className="text-xl font-medium tracking-tight text-gray-900 uppercase">
                    Payment
                  </p>
                  {paymentIntent?.status === "succeeded" && (
                    <div className="flex self-center justify-between w-11/12 px-4 py-2 mt-5 font-semibold bg-gray-100 rounded-md">
                      {paymentIntent.charges ? (
                        <div className="flex flex-col ">
                          <div className="font-medium tracking-tight text-gray-700 uppercase textsm">
                            {cardIcon()}
                            <p className="text-gray-700 normal-case text-md ">
                              {"  "}**** **** **** {last4}
                            </p>
                          </div>{" "}
                          <p className="text-sm text-gray-700 ">{`${exp_month}/${exp_year}`}</p>
                          <p className="text-sm text-gray-700 ">{name}</p>
                          <div className="flex flex-col pr-4 mt-2 h-5/6" />
                        </div>
                      ) : (
                        <Spinner className="mt-10" />
                      )}
                      <div className="flex flex-col justify-between h-full">
                        <p className="text-lg text-gray-900">
                          {formatAmountForDisplay( paymentIntent.amount / 100,'GBP')}{" "}
                        </p>
                        <Link href={receiptUrl || "/#"} target="_blank">
                          <a className="text-blue-600 underline hover:text-blue-500 ">
                            Receipt
                          </a>
                        </Link>
                      </div>
                    </div>
                  )}
                  {session && paymentIntent?.status !== "succeeded" && (
                    <div className="flex flex-col justify-between h-full">
                      <p className="text-lg text-gray-900">
                        Please follow through with payment to finish your
                        booking:
                      </p>
                      <Link href={session?.url || "/#"} target="_blank">
                        <a className="text-blue-600 underline hover:text-blue-500 ">
                          Pay Now
                        </a>
                      </Link>
                    </div>
                  )}
                </div>
              )} */}

              <div className="flex justify-center w-full gap-4">
                {/* <button className="w-full px-2 py-2 text-lg rounded-lg bg-sky-500 text-gray-50">Edit booking</button> */}
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
                  content="You cannot cancel this booking."
                >
                  {" "}
                  {booking?.status === "Cancelled" ||
                    (booking?.status !== "Completed" && (
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
                        className="w-full px-4 py-2 my-4 text-lg bg-red-500 rounded-lg disabled:bg-gray-500 text-gray-50"
                      >
                        Cancel booking
                      </button>
                    ))}
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
