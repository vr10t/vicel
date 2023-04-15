/* eslint-disable react/style-prop-object */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { FaMapMarkerAlt } from "@react-icons/all-files/fa/FaMapMarkerAlt";
import { BsFillPersonFill } from "@react-icons/all-files/bs/BsFillPersonFill";
import { BsFillPersonPlusFill } from "@react-icons/all-files/bs/BsFillPersonPlusFill";
import { BsCalendarFill } from "@react-icons/all-files/bs/BsCalendarFill";
import { FaMapPin } from "@react-icons/all-files/fa/FaMapPin";
import { BsClockFill } from "@react-icons/all-files/bs/BsClockFill";
import { FaRoute } from "@react-icons/all-files/fa/FaRoute";
import { FaHourglassHalf } from "@react-icons/all-files/fa/FaHourglassHalf";
import { FaTaxi } from "@react-icons/all-files/fa/FaTaxi";
import { FaInfoCircle } from "@react-icons/all-files/fa/FaInfoCircle";
import { FaCheck } from "@react-icons/all-files/fa/FaCheck";
import { Tooltip, Spinner } from "flowbite-react";
import React, {
  MouseEventHandler,
  useRef,
  useState,
} from "react";
import { FaPlaneDeparture } from "@react-icons/all-files/fa/FaPlaneDeparture";
import dayjs from "dayjs";
import { FaStickyNote } from "@react-icons/all-files/fa/FaStickyNote";

import { bookingStore, secureStore } from "../../store/bookingStore";
import userStore from "../../store/user";
import { formatAmountForDisplay } from "../../utils/stripe-helpers";
import { trpc } from "../../utils/trpc";

type Props = {
  onSubmit: MouseEventHandler<HTMLButtonElement> | undefined;
  disabled: boolean | undefined;
  // eslint-disable-next-line react/require-default-props
  isNight?: boolean;
};

export default function Summary(props: Props) {
  const { onSubmit, disabled, isNight } = props;
  const {
    location,
    destination,
    airline_name,
    date,
    distance,
    duration,
    flight_monitoring,
    flight_number,
    instructions,
    passengers,
    plane_arriving_from,
    service,
    setService,
    setDistance,
    setDuration,
    time,
    setDate,
    setDestination,
    setLocation,
    setPassengers,
    setTime,

  } = bookingStore();
  const {
    first_name,
    last_name,
    email,
    phone,
    total_trip_price,
    google,
  } = secureStore();
  const completed =
    "flex flex-row-reverse justify-start float-left px-1 gap-1 text-blue-600 ";
  const uncompleted = "mx-auto py-2 text-gray-500 ";

  const [locationEditable, setLocationEditable] = useState(false);
  const [destinationEditable, setDestinationEditable] = useState(false);
  const [passengersEditable, setPassengersEditable] = useState(false);
  const [dateEditable, setDateEditable] = useState(false);
  const [timeEditable, setTimeEditable] = useState(false);
  const [passengersConst, setPassengersConst] = useState(passengers || 0);
  const [dateConst, setDateConst] = useState(date || "");
  const [timeConst, setTimeConst] = useState(time || "");
  const [origin, setOrigin] = useState(location || "");
  const [destinationConst, setDestinationConst] = useState(destination || "");

  const originInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const getDistance = trpc.useMutation(["distance.get"], {
    onSuccess: async (data) => {
      if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
        setDistance(data.rows[0].elements[0].distance.text);
        setDuration(data.rows[0].elements[0].duration.text);
        setLocation(data.origin_addresses[0]);
        setDestination(data.destination_addresses[0]);
        return;
      }
      setDistance("error");
      setDuration("error");
    },
  });

  let bounds;

  const now = dayjs().format("YYYY-MM-DD-HH:mm");
  const today = dayjs().format("YYYY-MM-DD");
  const threeMonthsFromNow = dayjs().add(3, "month").format("YYYY-MM-DD");
  const departureDate = new Date(`${date} ${time}`);
  const dateTime = dayjs(`${date} ${time}`);
  const isValidDate = dateTime.isAfter(dayjs().add(2, "hours"));

  const handleChangeOrigin = (e: any) => {
    setOrigin(e.target.value);
  };
  const handleChangeDestination = (e: any) => {
    setDestinationConst(e.target.value);
  };
  if (google) {
    const northEast = new google.maps.LatLng(51.89, -0.2767);
    const southWest = new google.maps.LatLng(51.6444, -0.67);
    // Create a bounding box with sides ~10km away from the center point
    bounds = new google.maps.LatLngBounds(southWest, northEast);

    const searchOptions = {
      bounds,
      strictBounds: true,
      componentRestrictions: { country: "gb" },
      fields: ["address_components", "geometry"],
      // types:["address"]
    };
    if (originInputRef.current) {
      const autocompleteOrigin = new google.maps.places.Autocomplete(
        originInputRef.current,
        searchOptions
      );
    }
    if (destinationInputRef.current) {
      const autocompleteDestination = new google.maps.places.Autocomplete(
        destinationInputRef.current,
        searchOptions
      );
    }
  }
  function edit(e: any) {
    switch (e.target.parentNode.id) {
      case "location":
        setLocationEditable(true);
        break;
      case "destination":
        setDestinationEditable(true);
        break;
      case "passengers":
        setPassengersEditable(true);
        break;
      case "date":
        setDateEditable(true);

        break;
      case "time":
        setTimeEditable(true);

        break;

      default:
        break;
    }
  }
  function save(e: any) {
    switch (e.target.parentNode.id) {
      case "location":
        setLocationEditable(false);
        if (origin) {
          setLocation(origin);
          if (location && destination) {
            getDistance.mutate({
              location: origin || location,
              destination: destinationConst || destination,
              dateTime: departureDate,
            });
          }
        }
        break;
      case "destination":
        setDestinationEditable(false);
        if (destinationConst) {
          setDestination(destinationConst);
          if (location && destination) {
            getDistance.mutate({
              location: origin || location,
              destination: destinationConst || destination,
              dateTime: departureDate,
            });
          }
        }
        break;
      case "passengers":
        setPassengersEditable(false);
        if (passengersConst) {
          setPassengers(passengersConst);
          //if passengers changed, update service based on the number of passengers
          if (passengersConst <= 3) {
            setService("Standard");
          }
          if (passengersConst > 3) {
            setService("PC");
          }
          if (passengersConst > 6) {
            setService("MPV");
          }
        }
        break;
      case "date":
        setDateEditable(false);
        if (dateConst) {
          setDate(dateConst);
        }

        break;
      case "time":
        setTimeEditable(false);
        if (timeConst) {
          setTime(timeConst);
        }

        break;

      default:
        break;
    }
  }


  return (
    <div>
      <div className="w-full pb-32 mt-5 overflow-auto bg-fixed bg-gray-100 overscroll-none lg:h-fit lg:pt-0 lg:pb-24 lg:mt-0 lg:max-w-lg">
        <div className="flex overscroll-none top-10 lg:top-0 bg-gray-100 w-full lg:w-[32rem] self-center h-20 lg:h-auto  justify-center mb-4 text-3xl font-bold  text-gray-800   ">
          <p className="label lg">Summary</p>
        </div>
        <div className="bg-fixed overscroll-none ">
          <div className="flex w-5/6 m-auto bg-gray-200 rounded-2xl">
            {distance && (
              <div className="flex flex-col py-6 gap-4 grow">
                <div className="flex flex-row w-5/6 m-auto text-3xl font-bold text-gray-800">
                  {" "}
                  <div className="">
                    <label className="sr-only">Distance</label>
                    <Tooltip style="light" content="Distance">
                      <FaRoute className="z-2" />
                    </Tooltip>
                  </div>
                  <div className="mx-4 border-t-0 border-b-2 border-gray-400 border-dashed h-1/2 grow" />
                  <div className="self-center text-base font-bold">
                    {distance || <Spinner />}
                  </div>
                </div>

                <div className="flex flex-row self-center w-5/6 m-auto text-3xl font-bold text-gray-800">
                  {" "}
                  <div className="">
                    <label className="sr-only">Estimated trip time</label>
                    <Tooltip style="light" content="Estimated trip time">
                      <FaHourglassHalf />
                    </Tooltip>
                  </div>
                  <div className="mx-4 border-t-0 border-b-2 border-gray-400 border-dashed h-1/2 grow" />
                  <div className="self-center text-base font-bold">
                    {duration || <Spinner />}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="w-5/6 p-4 px-4 m-auto mt-5 bg-gray-200 grid grid-cols-4 gap-2 rounded-2xl">
            <div className="my-auto text-3xl text-gray-800 col-span-1">
              {" "}
              <div className={location ? completed : uncompleted}>
                {location ? (
                  <FaCheck className="float-right z-[4] text-sm" />
                ) : (
                  ""
                )}
                <FaMapMarkerAlt className="z-[4]" />
              </div>
            </div>
            <div className="pt-1 col-span-2">
              <p className="font-bold text-gray-800 lg:text-sm">
                Pickup address
              </p>
              {locationEditable ? (
                <input
                  ref={originInputRef}
                  value={origin}
                  onChange={handleChangeOrigin}
                  onBlur={handleChangeOrigin}
                />
              ) : (
                <div>
                  {location ? (
                    <p className="text-sm text-gray-500">{location}</p>
                  ) : (
                    <p className="text-sm text-red-500">Required</p>
                  )}
                </div>
              )}
            </div>

            <div id="location" className="my-auto">
              {locationEditable ? (
                <button
                  type="button"
                  onClick={save}
                  className="mb-10 text-sm font-bold text-indigo-700 underline sm:mb-0 lg:mb-10 hover:no-underline hover:text-indigo-500">
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={edit}
                  className="text-sm font-bold text-indigo-700 underline hover:no-underline hover:text-indigo-500">
                  Change
                </button>
              )}
            </div>
          </div>
          <div className="w-5/6 p-4 px-4 m-auto mt-5 bg-gray-200 grid grid-cols-4 gap-2 rounded-2xl">
            <div className="my-auto text-3xl text-gray-800 col-span-1">
              {" "}
              <div className={destination ? completed : uncompleted}>
                {destination ? (
                  <FaCheck className="float-right text-sm z-[4]" />
                ) : (
                  ""
                )}
                <FaMapPin className="z-[4]" />
              </div>
            </div>
            <div className="pt-1 col-span-2">
              <p className="font-bold text-gray-800 lg:text-sm">
                Dropoff address
              </p>
              {destinationEditable ? (
                <input
                  ref={destinationInputRef}
                  value={destinationConst}
                  onChange={handleChangeDestination}
                  onBlur={handleChangeDestination}
                />
              ) : (
                <div>
                  {destination ? (
                    <p className="text-sm text-gray-500">{destination}</p>
                  ) : (
                    <p className="text-sm text-red-500">Required</p>
                  )}
                </div>
              )}
            </div>

            <div id="destination" className="my-auto">
              {destinationEditable ? (
                <button
                  type="button"
                  onClick={save}
                  className="mb-10 text-sm font-bold text-indigo-700 underline sm:mb-0 lg:mb-10 hover:no-underline hover:text-indigo-500">
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={edit}
                  className="text-sm font-bold text-indigo-700 underline hover:no-underline hover:text-indigo-500">
                  Change
                </button>
              )}
            </div>
          </div>

          <div className="w-5/6 p-4 px-4 m-auto mt-5 bg-gray-200 grid grid-cols-4 gap-2 rounded-2xl">
            <div className="my-auto text-3xl text-gray-800 col-span-1">
              {" "}
              <div className={passengers ? completed : uncompleted}>
                {passengers ? (
                  <FaCheck className="float-right text-sm z-[4]" />
                ) : (
                  ""
                )}
                <BsFillPersonPlusFill className="z-[4]" />
              </div>
            </div>
            <div className="pt-1 col-span-2">
              <p className="font-bold text-gray-800 lg:text-sm">Passengers</p>
              {passengersEditable ? (
                <input
                  className="flex flex-1 w-auto px-4 py-2 text-base text-gray-700 placeholder-gray-500 border-0 appearance-none bg-gray-50 rounded-md ring-2 shadow-sm grow focus-ring-full focus:outline-none focus:ring-2 focus:ring-sky-600"
                  type="number"
                  min="1"
                  max="16"
                  value={passengersConst}
                  onChange={(e) =>
                    setPassengersConst(parseInt(e.target.value, 10))
                  }
                />
              ) : (
                <p className="text-sm text-gray-500">{passengers}</p>
              )}
            </div>

            <div id="passengers" className="my-auto">
              {passengersEditable ? (
                <button
                  type="button"
                  onClick={save}
                  className="mb-10 text-sm font-bold text-indigo-700 underline sm:mb-0 lg:mb-10 hover:no-underline hover:text-indigo-500">
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={edit}
                  className="text-sm font-bold text-indigo-700 underline hover:no-underline hover:text-indigo-500">
                  Change
                </button>
              )}
            </div>
          </div>

          <div className="w-5/6 p-4 px-4 m-auto mt-5 bg-gray-200 grid grid-cols-4 gap-2 rounded-2xl">
            <div className="my-auto text-3xl text-gray-800 col-span-1">
              {" "}
              <div className={date && isValidDate ? completed : uncompleted}>
                {date && isValidDate ? (
                  <FaCheck className="float-right text-sm z-[4]" />
                ) : (
                  ""
                )}
                <BsCalendarFill className="z-[4]" />
              </div>
            </div>
            <div className="pt-1 col-span-2">
              <p className="font-bold text-gray-800 lg:text-sm">Pickup date</p>
              {dateEditable ? (
                <input
                  className="flex flex-1 w-auto px-4 py-2 text-base text-gray-700 placeholder-gray-500 border-0 appearance-none bg-gray-50 rounded-md ring-2 shadow-sm grow focus-ring-full focus:outline-none focus:ring-2 focus:ring-sky-600"
                  type="date"
                  min={today}
                  max={threeMonthsFromNow}
                  value={dateConst}
                  onChange={(e) => setDateConst(e.target.value)}
                />
              ) : (
                <p className="flex flex-col text-sm text-gray-500">
                  {date}
                  {!isValidDate && (
                    <p className="text-red-500">
                      Pickup must be at least 2 hours from now
                    </p>
                  )}
                </p>
              )}
            </div>

            <div id="date" className="my-auto">
              {dateEditable ? (
                <button
                  type="button"
                  onClick={save}
                  className="mb-10 text-sm font-bold text-indigo-700 underline sm:mb-0 lg:mb-10 hover:no-underline hover:text-indigo-500">
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={edit}
                  className="text-sm font-bold text-indigo-700 underline hover:no-underline hover:text-indigo-500">
                  Change
                </button>
              )}
            </div>
          </div>

          <div className="w-5/6 p-4 px-4 m-auto mt-5 bg-gray-200 grid grid-cols-4 gap-2 rounded-2xl">
            <div className="my-auto text-3xl text-gray-800 col-span-1">
              {" "}
              <div className={time && isValidDate ? completed : uncompleted}>
                {time && isValidDate ? (
                  <FaCheck className="float-right text-sm z-[4]" />
                ) : (
                  ""
                )}
                <BsClockFill className="z-[4]" />
              </div>
            </div>
            <div className="pt-1 col-span-2">
              <p className="font-bold text-gray-800 lg:text-sm">Pickup time</p>
              {timeEditable ? (
                <input
                  className="flex flex-1 w-auto px-4 py-2 text-base text-gray-700 placeholder-gray-500 border-0 appearance-none bg-gray-50 rounded-md ring-2 shadow-sm grow focus-ring-full focus:outline-none focus:ring-2 focus:ring-sky-600"
                  type="time"
                  min={now}
                  value={timeConst}
                  onChange={(e) => setTimeConst(e.target.value)}
                />
              ) : (
                <p className="flex flex-col text-sm text-gray-500">
                  {time}
                  {!isValidDate && (
                    <p className="text-red-500">
                      Pickup must be at least 2 hours from now
                    </p>
                  )}
                </p>
              )}
            </div>

            <div id="time" className="my-auto">
              {timeEditable ? (
                <button
                  type="button"
                  onClick={save}
                  className="mb-10 text-sm font-bold text-indigo-700 underline sm:mb-0 lg:mb-10 hover:no-underline hover:text-indigo-500">
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={edit}
                  className="text-sm font-bold text-indigo-700 underline hover:no-underline hover:text-indigo-500">
                  Change
                </button>
              )}
            </div>
          </div>

          {flight_monitoring && (
            <div className="w-5/6 p-4 px-4 m-auto mt-5 bg-gray-200 grid grid-cols-4 gap-2 rounded-2xl">
              <div className="my-auto text-3xl text-gray-800 col-span-1">
                {" "}
                <div
                  className={
                    flight_number && plane_arriving_from && airline_name
                      ? completed
                      : uncompleted
                  }>
                  {flight_number && plane_arriving_from && airline_name ? (
                    <FaCheck className="float-right text-sm z-[4]" />
                  ) : (
                    ""
                  )}
                  <FaPlaneDeparture className="z-[4]" />
                </div>
              </div>
              <div className="pt-1 col-span-2">
                <p className="font-bold text-gray-800 lg:text-sm">
                  Flight Monitoring
                </p>
                {flight_number && plane_arriving_from && airline_name ? (
                  <>
                    <p className="text-sm text-gray-500">
                      {plane_arriving_from}
                    </p>
                    <p className="text-sm text-gray-500"> {airline_name}</p>
                    <p className="text-sm text-gray-500">{flight_number}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    You haven&apos;t provided any flight details.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="w-5/6 p-4 px-4 m-auto mt-5 bg-gray-200 grid grid-cols-4 gap-2 rounded-2xl">
            <div className="my-auto text-3xl text-gray-800 col-span-1">
              {" "}
              <div className={service ? completed : uncompleted}>
                {service ? (
                  <FaCheck className="float-right text-sm z-[4]" />
                ) : (
                  ""
                )}
                <FaTaxi className="z-[4]" />
              </div>
            </div>
            <div className="pt-1 col-span-2">
              <p className="font-bold text-gray-800 lg:text-sm">Service</p>
              {service ? (
                <p className="text-sm text-gray-500">
                  {service === "PC" ? "People Carrier" : service}
                </p>
              ) : (
                <p className="text-sm text-red-500">Required</p>
              )}
            </div>
          </div>
          <div className="w-5/6 p-4 px-4 m-auto mt-5 bg-gray-200 grid grid-cols-4 gap-2 rounded-2xl">
            <div className="my-auto text-3xl text-gray-800 col-span-1">
              {" "}
              <div
                className={
                  first_name && last_name && email && phone
                    ? completed
                    : uncompleted
                }>
                {first_name && last_name && email && phone ? (
                  <FaCheck className="float-right text-sm z-[4]" />
                ) : (
                  ""
                )}
                <BsFillPersonFill className="z-[4]" />
              </div>
            </div>
            <div className="pt-1 col-span-2">
              <p className="font-bold text-gray-800 lg:text-sm">
                Passenger details
              </p>

              {first_name && last_name && email && phone ? (
                <>
                  <p className="text-sm text-gray-500">
                    {first_name} {last_name}
                  </p>
                  <p className="text-sm text-gray-500">{email}</p>
                  <p className="text-sm text-gray-500">{phone}</p>
                </>
              ) : (
                <p className="text-sm text-red-500">Required</p>
              )}
            </div>
          </div>
          {instructions && (
            <div className="w-5/6 p-4 px-4 m-auto mt-5 bg-gray-200 grid grid-cols-4 gap-2 rounded-2xl">
              <div className="my-auto text-3xl text-gray-800 col-span-1">
                {" "}
                <div className={completed}>
                  <FaCheck className="float-right text-sm z-[4]" />

                  <FaStickyNote className="z-[4]" />
                </div>
              </div>
              <div className="pt-1 col-span-2">
                <p className="font-bold text-gray-800 lg:text-sm">
                  Instructions
                </p>

                <p className="text-sm text-gray-500">{instructions}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between w-5/6 w-full p-4 px-4 m-auto mt-5 gap-2 rounded-2xl bg-gray-100/25">
            <div className="flex my-auto text-3xl font-medium text-gray-800 col-span-1">
              {" "}
              Total:
              {isNight && (
                <Tooltip
                  style="light"
                  content="This is a night time journey. There is a 20% surcharge for journeys between 11pm and 6am.">
                  <div className="relative w-0 h-1 bg-red-500">
                    <FaInfoCircle className="absolute z-0 text-xl text-gray-500 left-2 " />
                  </div>
                </Tooltip>
              )}
            </div>
            <div className="pt-1 text-xl text-gray-800 col-span-1">
              <p className="font-bold text-gray-800 lg:text-sm" />
              <p className="text-sm text-gray-500" />
            </div>

            <div className="my-auto text-3xl">
              <p className="text-3xl text-gray-500">
                {" "}
                {formatAmountForDisplay(total_trip_price, "GBP")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        className="mx-auto flex justify-center w-5/6 btn lg">
        Go to Payment
      </button>
    </div>
  );
}
