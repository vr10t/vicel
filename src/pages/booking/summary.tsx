/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable jsx-a11y/anchor-is-valid */
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {toast} from "react-hot-toast";
import { BsArrowReturnLeft } from "@react-icons/all-files/bs/BsArrowReturnLeft";
import ReactModal from "react-modal";
import Layout from "../../components/Layout";
import { bookingStore, secureStore } from "../../store/bookingStore";
import userStore from "../../store/user";
import { fetchPostJSON } from "../../utils/api-helpers";
import getStripe from "../../utils/getStripe";
import {
  formatAmountForDisplay,
  formatAmountForStripe,
} from "../../utils/stripe-helpers";
import { trpc } from "../../utils/trpc";

export default function Summary() {
  const { user } = userStore();
  const {
    first_name,
    last_name,
    email,
    phone,
    total_trip_price,
    setTotalTripPrice,
    user_id,
  } = secureStore();
  const {
    // payment,
    location,
    time,
    destination,
    passengers,
    date,
    service,
    instructions,
    flight_monitoring,
    flight_number,
    airline_name,
    plane_arriving_from,
    distance,
  } = bookingStore();
  const dateTime = dayjs(`${date} ${time}`).format("dddd, MMMM D YYYY, h:mm a");
  const updateProfile = trpc.useMutation(["user.update"]);
  const [loading, setLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [id, setId] = useState("");
  const [displayPrice, setDisplayPrice] = useState("");
  const [discount, setDiscount] = useState(0);
  const [distanceWarning, setDistanceWarning] = useState("");
  const router = useRouter();

  const { price, dest } = router.query;

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
      onSuccess: (data) => {
        if (price) {
          setTotalTripPrice(parseFloat(price as string));
          setDisplayPrice(formatAmountForDisplay(price, "GBP"));
          return;
        }
        setTotalTripPrice(data.price);
        setDisplayPrice(
          formatAmountForDisplay(data.price - data.price * discount, "GBP")
        );
      },
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  const updateBooking = trpc.useMutation(["bookings.update"]);

  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const promo = trpc.useMutation(["promo.redeem"]);

  const handleCoupon = async () => {
    if (coupon) {
      await promo.mutateAsync(
        { code: coupon },
        {
          onSuccess: (data) => {
            setCouponSuccess(data.message);
            setCouponError("");
            setDiscount(0.15);
          },
          onError: (error) => {
            setCouponError(error.message);
            setCouponSuccess("");
          },
        }
      );
    }
  };

  async function handleRedirectToCheckout(bookingId: string, secret: string) {
    // Create a Checkout Session.
    const response = await fetchPostJSON("/api/checkout_sessions", {
      address: destination,
      bookingId,
      amount: total_trip_price,
      secret,
      subtotal: formatAmountForDisplay(price ?? total_trip_price, "GBP"),
      grand: formatAmountForDisplay(price ?? total_trip_price, "GBP"),
      name: first_name,
      email,
      location,
      destination,
      dateTime,
      coupon,
    });
    const {checkoutSession, statusCode} = response;
    if (!statusCode?.toString().startsWith("2")) {
      toast.error(response.message);
      setLoading(false);
      return;
    }
    updateBooking.mutate({
      id: bookingId,
      checkout_session: checkoutSession.id,
    });
    const stripe = await getStripe();
    if (!stripe) {
      setLoading(false);
      toast.error("Something went wrong. Please try again");
      return;
    }
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSession.id,
    });
    if (error) {
      setLoading(false);
      toast.error(error.message as string);
    }
  }

  const createBooking = trpc.useMutation(["bookings.create"], {
    onSuccess: (data) => {
      const bookingId = data[0]?.id;
      setId(bookingId);
      if (user) {
        //if user profile is missing first name, last name,  phone, update it
        if (
          (!user.profile?.first_name ||
            !user.profile?.last_name ||
            !user.profile?.phone) &&
          first_name &&
          last_name &&
          phone
        ) {
          updateProfile.mutate({
            id: user.id,
            firstName: first_name,
            lastName: last_name,
            phone,
          });
          if (updateProfile.isError) {
            setLoading(false);
            return;
          }
        }
      }
      // if (payment === "Card") {
      toast.success("Redirecting to payment...", {
        duration: 4000,
      });
      // setLoading(false);

      handleRedirectToCheckout(bookingId, data[0]!.secret!);
      // }
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });


  useEffect(() => {
    setPageLoaded(true);
  }, []);

  async function submit(ev: any) {
    setLoading(true);
    ev.preventDefault();

    if (
      !location ||
      !destination ||
      !date ||
      !time ||
      !passengers ||
      !service ||
      !first_name ||
      !last_name ||
      !email ||
      !phone
      // !payment
    ) {
      toast.error("Please complete all details before submitting");
      setLoading(false);
      return;
    }

    createBooking.mutate({
      user_id,
      first_name,
      last_name,
      email,
      phone,
      location,
      destination,
      passengers,
      date,
      time,
      flight_number,
      distance,
      service,
      // payment,
      plane_arriving_from,
      airline_name,
      total_trip_price: displayPrice.includes("£")
        ? displayPrice
        : formatAmountForDisplay(total_trip_price, "GBP"),
      instructions,
      status: "Pending",
    });
  }
  return (
    <Layout title="Summary">
      <ReactModal isOpen={loading} className="w-0 h-0" />

      {pageLoaded && (
        <div className="flex justify-center min-h-screen mx-2 max-w-screen">
          <div className="flex flex-col ">
            <div className="w-full px-6 mt-4 ">
              <div className="flex flex-col justify-between p-4 px-4 m-auto bg-white border-b shadow sm:flex-row gap-4 ">
                <p className="text-lg font-medium text-gray-900 ">
                  Pickup address
                </p>
                <p className="text-gray-600 ">{location}</p>
              </div>
              <div className="flex flex-col justify-between p-4 px-4 m-auto bg-white border-b shadow sm:flex-row gap-4 ">
                <p className="text-lg font-medium text-gray-900 ">
                  Dropoff address
                </p>
                <p className="text-gray-600 ">{destination}</p>
              </div>

              <div className="flex flex-col justify-between p-4 px-4 m-auto bg-white border-b shadow sm:flex-row gap-4 ">
                <p className="text-lg font-medium text-gray-900 ">
                  Pickup date
                </p>
                <p className="text-gray-600 ">{dateTime}</p>
              </div>

              <div className="flex justify-between p-4 px-4 m-auto bg-white border-b shadow gap-4 ">
                <p className="text-lg font-medium text-gray-900 ">Passengers</p>
                <p className="text-gray-600 ">{passengers}</p>
              </div>
              <div className="flex flex-col justify-between p-4 px-4 m-auto bg-white border-b shadow ">
                <p className="text-lg font-medium text-gray-900 ">
                  Passenger details
                </p>
                {first_name && last_name ? (
                  <p className="text-gray-600 ">
                    {first_name} {last_name}
                  </p>
                ) : (
                  <p className="text-red-500">Name is required</p>
                )}
                {email ? (
                  <p className="text-gray-600 ">{email}</p>
                ) : (
                  <p className="text-red-500">Email is required</p>
                )}
                {phone ? (
                  <p className="text-gray-600 ">{phone}</p>
                ) : (
                  <p className="text-red-500">Phone is required</p>
                )}
              </div>
              <div className="flex justify-between p-4 px-4 m-auto bg-white border-b shadow gap-4 ">
                <p className="text-lg font-medium text-gray-900 ">Service</p>
                <p className="text-gray-600 ">
                  {service === "PC" ? "People Carrier" : service}
                </p>
              </div>
              {flight_monitoring && (
                <div className="z-[-1] w-full">
                  <div className="flex justify-between w-full p-4 px-4 m-auto bg-white border-b shadow gap-4 ">
                    <p className="text-lg font-medium text-gray-900 ">
                      Flight number
                    </p>
                    {flight_number ? (
                      <p className="text-gray-600 ">{flight_number}</p>
                    ) : (
                      <p className="text-amber-500">No info provided</p>
                    )}
                  </div>
                  <div className="flex justify-between p-4 px-4 m-auto bg-white border-b shadow gap-4 ">
                    <p className="text-lg font-medium text-gray-900 ">
                      Plane arriving from
                    </p>
                    {plane_arriving_from ? (
                      <p className="text-gray-600 ">{plane_arriving_from}</p>
                    ) : (
                      <p className="text-amber-500">No info provided</p>
                    )}
                  </div>
                  <div className="flex justify-between p-4 px-4 m-auto bg-white border-b shadow gap-4 ">
                    <p className="text-lg font-medium text-gray-900 ">
                      Airline name
                    </p>
                    {airline_name ? (
                      <p className="text-gray-600 ">{airline_name}</p>
                    ) : (
                      <p className="text-amber-500">No info provided</p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-col justify-between p-4 px-4 m-auto bg-white border-b shadow ">
                <p className="text-lg font-medium text-gray-900 ">
                  Special Instructions
                </p>
                <p className="text-gray-600 ">
                  {instructions || "No instructions."}
                </p>
              </div>

              <div className="flex justify-between px-4 pt-4 m-auto bg-white shadow gap-4 ">
                <p className="text-gray-600 ">Subtotal</p>
                <p className="text-gray-600 ">
                  {total_trip_price &&
                    formatAmountForDisplay(total_trip_price, "GBP")}
                </p>
              </div>
              {couponSuccess && total_trip_price && (
                <div className="flex justify-between px-4 pt-4 m-auto bg-white shadow gap-4 ">
                  <p className="text-gray-600 ">Discount</p>
                  <p className="text-gray-600 ">
                    {formatAmountForDisplay(total_trip_price * 0.1, "GBP")}
                  </p>
                </div>
              )}
              <div className="flex justify-between p-4 px-4 pb-6 m-auto bg-white border-b shadow gap-4 ">
                <p className="text-2xl font-medium text-gray-900 ">
                  Grand Total
                </p>
                <p className="text-2xl text-gray-600 ">{formatAmountForDisplay(total_trip_price, "GBP")}</p>
              </div>
              {/**
               *coupon redemption
               **/}
              <div className="flex flex-col justify-between p-4 px-4 m-auto bg-white border-b shadow ">
                <p className="text-lg font-medium text-gray-900 ">Coupon</p>
                <div className="flex justify-between gap-4">
                  <input
                    type="text"
                    className="field"
                    placeholder="Enter coupon code"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn pink"
                    onClick={handleCoupon}
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-red-500">{couponError}</p>}
                {couponSuccess && (
                  <p className="text-green-600">{couponSuccess}</p>
                )}
              </div>

              <div className="flex flex-col items-center justify-center mt-2 gap-2">
                <div className="flex items-center">
                  <Link href={dest ? `/fixed-rates/${dest}` : "/booking"}>
                    <a className="flex my-4 hover:text-blue-600 text-blue-700">
                      <BsArrowReturnLeft className="z-0 mr-2 text-2xl font-extrabold text-center" />{" "}
                      Back to order
                    </a>
                  </Link>
                  {distanceWarning && (
                    <p className="text-red-600">{distanceWarning}</p>
                  )}
                </div>
                <div className="flex justify-center items-center mb-4 w-full">
                  <button
                    type="submit"
                    onClick={submit}
                    className="btn lg w-5/6"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
