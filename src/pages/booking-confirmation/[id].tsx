/* eslint-disable jsx-a11y/anchor-is-valid */
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FaCheckCircle } from "@react-icons/all-files/fa/FaCheckCircle";
import { Spinner } from "flowbite-react";
import Layout from "../../components/Layout";
import { bookingStore } from "../../store/bookingStore";
import userStore from "../../store/user";
import { trpc } from "../../utils/trpc";
import { Database } from "../../../types/supabase";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

export default function BookingConfirmation() {
  const router = useRouter();
  const { id: sessionId, qsid } = router.query;
  const [booking, setBooking] = useState<BookingRow | null>();
  const [paymentIntent, setPaymentIntent] = useState<any>();
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setError] = useState<string>("");
  const { user } = userStore();
  const b = trpc.useQuery(["bookings.verify", { secret: qsid as string }], {
    enabled: !!qsid,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (!data) {
        setError("Booking not found.");
        return;
      }
      setBooking(data[0]);
      setLoading(false);
    },
    onError: (bookingError) => {
      setError(bookingError.message);
      setLoading(false);
    },
  });
  const isValidCheckoutSession = (id:string) => {
  const regex = /^cs_(live|test)_[A-Za-z0-9]{64}$/;
  return regex.test(id);
};
  const getPaymentIntent = async () => {
    if (!isValidCheckoutSession(sessionId as string)) {
      setError("Invalid booking id");
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/checkout_sessions/${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.statusCode === 500) {
          setPaymentIntent(null);

          setLoading(false);
          //send email that payment failed
          return;
        }
        if (data.status === "complete") {
          setStatus("complete");
          // if user is not logged in, confirm user
          setLoading(false);
        }
        setPaymentIntent(data);
        setLoading(false);
      });
  };
  useEffect(() => {
    if (!booking && !status && !loading) {
      setError("Booking not found");
    }
  }, [booking, status, loading]);
  useEffect(() => {
    setLoading(true);
    //if id starts with "cs_" it's a payment intent
    if (sessionId&& isValidCheckoutSession(sessionId as string)) {
      getPaymentIntent();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen">
          <Spinner />
        </div>
      </Layout>
    );
  }
  if (err || !booking) {
    return (
      <Layout title={err}>
        <h1 className="flex justify-center items-center h-screen">
          {err || " Booking not found."}
        </h1>
      </Layout>
    );
  }
  return (
    <Layout title={`Thank you `}>
      <div className="flex flex-col mt-20 min-h-screen p-4 ">
        {
          //if booking status is confirmed
          <div className="text-center">
            <div className="text-6xl w-full flex justify-center mb-10 font-bold">
              <FaCheckCircle className="z-0 text-green-500" />
            </div>
            <h1 className="text-4xl font-medium text-blue-600 mb-4">
              Thank you for booking with us!
            </h1>

            <h6>
              We will send you an email with your booking details shortly.
            </h6>
            <h6>
              If you have any questions, please contact us at
              <Link href="mailto:contact@vicel.co.uk" passHref>
                <a className="text-blue-500 hover:text-blue-400">
                  {" "}
                  contact@vicel.co.uk
                </a>
              </Link>
            </h6>
            <div className="">
              <Link
                href={
                  user
                    ? `/my-account/bookings/${booking?.id}`
                    : `/b/${booking?.id}?sid=${qsid}`
                }
                passHref>
                <a className="text-blue-500 hover:text-blue-400">
                  {" "}
                  View booking
                </a>
              </Link>
            </div>
          </div>
        }
      </div>
    </Layout>
  );
}
