/* eslint-disable no-nested-ternary */
/* eslint-disable object-shorthand */
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { FaAngleRight } from "@react-icons/all-files/fa/FaAngleRight";
import { Spinner } from "flowbite-react";
import calendar from "dayjs/plugin/calendar";
import userStore from "../../store/user";
import { supabase } from "../../utils/supabaseClient";
import { Database } from '../../../types/supabase';

type BookingRow = Database['public']['Tables']['bookings']['Row']
type Booking = BookingRow & {
  upcoming?: boolean;
}
function Bookings() {
  dayjs.extend(calendar);
  const { user, isLoading } = userStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [sortedBookings, setSortedBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  // eslint-disable-next-line object-shorthand
  const getAll = async () => {
    const { data, error: sbError } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user?.id);
    if (data) setBookings(data);
    if (sbError) setError(sbError.message);
  };
  const getAllMemoized = useMemo(() => getAll, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in?ref=/bookings");
      return;
    }
    getAllMemoized();
  }, [user]);

  useEffect(() => {
    const isUpcoming = bookings?.map((booking) => {
      const date = dayjs(booking.date + booking.time);
      let statusColor = "";
      if (booking?.status === "Pending") {
        statusColor = "amber-400";
      }
      if (booking?.status === "Confirmed") {
        statusColor = "green-500";
      }
      if (booking?.status === "Cancelled") {
        statusColor = "red-500";
      }
      if (booking?.status === "Completed") {
        statusColor = "blue-500";
      }
      const upcoming = dayjs().isBefore(date);
      return { ...booking, upcoming, statusColor };
      // setBookings(bookings=>[...bookings])
    });
    setSortedBookings(isUpcoming as Booking[]);
  }, [bookings]);

  function handleClick(ev: any) {
    router.push(`/my-account/bookings/${ev.target.id}`);
  }
  return (
    <>
      <div />
      {!sortedBookings || sortedBookings.length === 0 ? (
        !error && !bookings ? (
          <div className="flex justify-center w-full mt-64">
            <Spinner size="xl" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-64">
            <p className="text-lg text-gray-900 font-medium">
              You have no bookings.
            </p>
          </div>
        )
      ) : (
        <div className="flex z-20 flex-col gap-4 items-center pt-10 w-full px-2 lg:w-3/4 lg:mx-auto">
          <div className="flex z-0 flex-col items-start w-full  0">
            <p className=" text-xl text-gray-900 uppercase">Upcoming</p>
            {sortedBookings.filter((b) => b.upcoming).length === 0 && (
              <div className="flex flex-col items-center justify-center w-full h-64">
                <p className="text-lg text-gray-900 font-medium">
                  You have no upcoming bookings.
                </p>
              </div>
            )}
            {sortedBookings.map((booking) =>
              booking.upcoming && booking.status !== "Cancelled" ? (
                <button
                  type="button"
                  key={booking.id}
                  onClick={handleClick}
                  className="flex justify-between p-6 my-2 w-full  rounded-md cursor-pointer group bg-gray-50 hover:bg-gray-200"
                  id={booking.id}
                >
                  <div
                    id={booking.id}
                    className="flex flex-col justify-center w-11/12"
                  >
                    <div
                      id={booking.id}
                      className="flex mb-2 text-lg text-gray-900 font-bold"
                    >
                      {booking.destination}
                    </div>
                    <div className="flex">
                      <div
                        id={booking.id}
                        className="flex pl-2 w-11/12 text-gray-700 text-sm truncate"
                      >
                        {dayjs(booking.date + booking.time).format(
                          "dddd, MMMM D, YYYY h:mm A"
                        )}
                      </div>
                    </div>
                    <div id={booking.id} className="flex">
                      <div
                        id={booking.id}
                        className="flex pl-2 w-11/12 text-gray-700 text-sm truncate"
                      >
                        {booking.total}
                      
                      </div>
                    </div>
                    {booking.status === "Pending" && (
                      <div className="flex w-full">
                        <div className="flex text-sm pl-2 text-amber-600 ">
                          Unconfirmed. Please check your email.
                        </div>{" "}
                      </div>
                    )}
                  </div>
                  <span className="self-center text-gray-900 text-xl">
                    <FaAngleRight />
                  </span>
                </button>
              ) : (
                ""
              )
            )}
          </div>
          <div className="flex z-0 flex-col items-start w-full  mb-10">
            <p className=" text-xl text-gray-900  uppercase">Past</p>
            {sortedBookings.filter((b) => !b.upcoming).length === 0 && (
              <div className="flex flex-col items-center justify-center w-full h-64">
                <p className="text-lg text-gray-900 font-medium">
                  You have no past bookings.
                </p>
              </div>
            )}
            {sortedBookings.map((booking) =>
              // if there are no past bookings, show a message

              booking.upcoming || booking.status === "Pending" ? (
                ""
              ) : (
                <button
                  type="button"
                  onClick={handleClick}
                  className="flex justify-between p-6  my-2 w-full  rounded-md cursor-pointer group bg-gray-50 hover:bg-gray-200"
                  key={booking.id}
                  id={booking.id}
                >
                  <div
                    id={booking.id}
                    className="flex flex-col justify-center w-11/12"
                  >
                    <div
                      id={booking.id}
                      className="flex mb-2 text-lg text-gray-900 font-bold"
                    >
                      {booking.destination}
                    </div>
                    <div className="flex">
                      {/* {booking.status === "Cancelled" && (
                        <p className="text-red-500 text-sm">Cancelled</p>
                      )} */}
                      <div
                        id={booking.id}
                        className="flex pl-2 w-11/12 text-gray-700 text-sm truncate"
                      >
                        {dayjs(booking.date + booking.time).format(
                          "dddd, MMMM D, YYYY h:mm A"
                        )}
                      </div>
                    </div>
                    <div id={booking.id} className="flex">
                      <div
                        id={booking.id}
                        className="flex pl-2 w-11/12 text-gray-700 text-sm truncate"
                      >
                        {booking.total}
                      </div>
                    </div>
                  </div>

                  <span className="self-center text-gray-900 text-xl">
                    <FaAngleRight />
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}
export default React.memo(Bookings);
