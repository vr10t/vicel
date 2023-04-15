/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { FaMapMarkerAlt } from "@react-icons/all-files/fa/FaMapMarkerAlt";
import { BsCalendarFill } from "@react-icons/all-files/bs/BsCalendarFill";
import { FaMapPin } from "@react-icons/all-files/fa/FaMapPin";
import { BsClockFill } from "@react-icons/all-files/bs/BsClockFill";
import { FaCrosshairs } from "@react-icons/all-files/fa/FaCrosshairs";
import { useRouter } from "next/router";
import { Label } from "flowbite-react";
import Link from "next/link";
import { Formik, Form as FormikForm, Field } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import ReactModal from "react-modal";
import { FaPlaneDeparture } from "@react-icons/all-files/fa/FaPlaneDeparture";
import { reverseGeocode } from "../../utils/google-helpers";
import StepperInput from "./StepperInput";
import userStore from "../../store/user";
import { bookingStore, secureStore } from "../../store/bookingStore";
import { trpc } from "../../utils/trpc";
import { AirportSelect } from "./AirportSelect";

// const HCaptcha = dynamic(() => import("@hcaptcha/react-hcaptcha"));
const getGreeting = () => {
  const hour = dayjs().hour();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};
namespace google {
  export namespace maps {
    export type LatLngBounds = any;
    export namespace places  {
      export type AutocompleteOptions = any;
      export type Autocomplete = any;
    }
  }
}
function Form() {
  const [mapsLoaded, setMapsLoaded] = useState(true);
  const { user } = userStore();

  const firstName =
    user?.profile?.first_name ??
    user?.user_metadata?.name ??
    user?.user_metadata?.first_name;
  //greeting based on time of day
  const greeting = useMemo(() => getGreeting(), []);

  const {
    location,
    destination,
    date,
    flight_monitoring,
    passengers,
    setDistance,
    setDuration,
    time,
    setDate,
    setDestination,
    setFlightMonitoring,
    setLocation,
    setTime,
  } = bookingStore();

  const {google} = secureStore();

  const [canSearch, setCanSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pickup, setPickup] = useState("");
  const router = useRouter();
  const [bounds, setBounds] = useState<google.maps.LatLngBounds>();
  const [searchOptions, setSearchOptions] =
    useState<google.maps.places.AutocompleteOptions>({
      bounds,
      strictBounds: true,
      componentRestrictions: { country: "gb" },
      fields: ["address_components", "geometry"],
    });
  const [autocompleteLocation, setAutocompleteLocation] =
    useState<google.maps.places.Autocomplete>();
  const [autocompleteDestination, setAutocompleteDestination] =
    useState<google.maps.places.Autocomplete>();
  const isAirport = (value: string | null | undefined) => {
    if (!value) return false;
    const regex = [/LTN/, /LGW/, /LHR/, /STN/, /SEN/, /LCY/, /SEN/];
    return regex.some((r) => r.test(value));
  };

  const destinationInputRef = useRef<HTMLInputElement>();
  const originInputRef = useRef<HTMLInputElement>();

  const airportSelectOriginRef = useRef<typeof AirportSelect>();
  const airportSelectDestinationRef = useRef<typeof AirportSelect>();

  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMapsLoaded(true);
    if (!google) return;

    const northEast = new google.maps.LatLng(51.89, -0.2767);
    const southWest = new google.maps.LatLng(51.6444, -0.67);
    // Create a bounding box with sides ~10km away from the center point
    setBounds(new google.maps.LatLngBounds(southWest, northEast));
    setSearchOptions({
      // eslint-disable-next-line object-shorthand
      bounds: bounds,
      strictBounds: true,
      componentRestrictions: { country: "gb" },
      fields: ["address_components", "geometry"],
      // types:["address"]
    });
    if (originInputRef.current) {
      setAutocompleteLocation(
        new google.maps.places.Autocomplete(
          originInputRef.current,
          searchOptions
        )
      );
    }
    if (destinationInputRef.current) {
      setAutocompleteDestination(
        new google.maps.places.Autocomplete(
          destinationInputRef.current,
          searchOptions
        )
      );
    }
    // });
  }, [google]);

  function success() {
    router.push("/booking");
    toast.dismiss();
  }
  const getDistance = trpc.useMutation(["distance.get"], {
    onSuccess: (data) => {
      if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
        if (
          parseFloat(data.rows[0].elements[0].distance.text) < 0.5 ||
          data.rows[0].elements[0].distance.text.includes("ft")
        ) {
          toast.dismiss();
          toast.error(
            "Your trip is too short. Please enter a distance greater than 1 mile."
          );
          setLoading(false);
          return;
        }
        //if distance is greater than 100 miles, return error.
        if (parseFloat(data.rows[0].elements[0].distance.text) > 100) {
          toast.dismiss();
          toast.error(
            `Your trip is too long (${data.rows[0].elements[0].distance.text}). Please enter a distance less than 100 miles. `,
            {
              duration: 10000,
            }
          );
          setLoading(false);
          return;
        }
        setDistance(data.rows[0].elements[0].distance.text);
        setDuration(data.rows[0].elements[0].duration_in_traffic.text);

        success();
        return;
      }
      setDistance("error");
      setDuration("error");
      toast.dismiss();
      toast.error("Error getting distance. Please try again.");
      setLoading(false);
    },
    onError: (error) => {
      toast.dismiss();

      setLoading(false);
      if (error.data?.code === "BAD_REQUEST") {
        toast.error(JSON.parse(error.message)[0].message);
      }
      if (
        error.data?.code === "NOT_FOUND" ||
        error.data?.code === "INTERNAL_SERVER_ERROR"
      ) {
        toast.error(error.message);
      }

      setDistance("error");
      setDuration("error");
    },
  });
  const fiveHoursFromNow = dayjs().add(2, "hours");
  const departureDate = new Date(`${date} ${time}`);

  function handleSearch(values: { date: string; time: string }) {
    setLoading(true);
    toast.loading("Searching...");
    setDate(values.date);
    setTime(values.time);

    //check if date and time are valid
    const dateAndTime = dayjs(`${values.date} ${values.time}`);
    if (!dateAndTime.isAfter(fiveHoursFromNow)) {
      toast.dismiss();
      toast.error("You may only book trips that start 2 hours from now", {
        duration: 5000,
      });
      setLoading(false);
      return;
    }

    if (location && destination) {
      getDistance.mutate({ location, destination, dateTime: departureDate });
    }

    if (!location || !destination) {
      console.log("location or destination is null", location, destination);
        if (!location) {
          toast.dismiss();
          toast.error("Please enter a valid pickup address", {
            duration: 5000,
          });
          setLoading(false);
          return;
        }
        if (!destination) {
          toast.dismiss();
          toast.error("Please enter a valid dropoff address", {
            duration: 5000,
          });
          setLoading(false);
        }
    }
  }
  useEffect(() => {
    if (location && destination && passengers && date && time) {
      setCanSearch(true);
    } else {
      setCanSearch(false);
    }
  }, [passengers, destination, location, date, time]);

  const handleChangeOrigin = (e: any) => {
    setLocation((e.target as HTMLInputElement).value);
  };

  const handleChangeDestination = (e: any) => {
    setDestination((e.target as HTMLInputElement).value);
  };
  function showPosition(position: {
    coords: { latitude: any; longitude: any };
  }) {
    reverseGeocode(position.coords.latitude, position.coords.longitude).then(
      (result) => {
        setLocation(result);
      }
    );
  }
  function getLocation() {
    navigator.geolocation.getCurrentPosition(showPosition);
    setPickup("Address");
  }
  function handleAddFlightMonitoring(event: any) {
    setFlightMonitoring(event.target.checked);
  }

  const isPickupAirport =
    (isAirport(location) || pickup === "Airport") && pickup !== "Address";

  const isFirstRender = useRef(true);
  function swapLocationDestination() {
    let placeholder = location;
    setLocation(destination);
    setDestination(placeholder);
  }
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    swapLocationDestination();
  }, [pickup]);

  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  return (
    <div
      ref={bgRef}
      className="absolute top-0 left-0 right-0 mx-auto !z-[99] lg:static">
      {bgRef.current && (
        <ReactModal
          appElement={bgRef.current}
          className="w-0"
          isOpen={loading}
        />
      )}

      <div className="flex flex-col mt-32 mb-4 overflow-x-hidden z-[99] lg:absolute lg:overflow-y-hidden lg:w-1/2 lg:top-40 lg:left-20">
        {user && pageLoaded ? (
          <>
            <h1 className="text-3xl font-bold text-center text-gray-900 lg:text-7xl md:text-5xl">
              {greeting}, {firstName}!
            </h1>
            <p className="self-center px-10 text-lg font-semibold text-center lg:pt-6 md:pt-4 lg:text-5xl text-slate-800">
              Ready for your next trip?
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-center text-gray-900 lg:text-7xl md:text-5xl">
              Stress-Free Airport Transfers: Book Your Reliable Ride Today!
            </h1>
            <div className="self-center px-10 text-lg font-semibold text-center text-gray-800 lg:pt-6 md:pt-4 lg:text-xl lg:text-gray-900">
              Order a taxi now without the hassle or Sign Up and save{" "}
              <p className="inline-flex font-extrabold text-blue-700 stroke-gray-50 stroke-2">
                10%{" "}
              </p>
              {"  "}on your first trip!
            </div>

            <Link href="/sign-up">
              <a className="self-center mt-4 w-72 btn lg">
                Get Started
              </a>
            </Link>
          </>
        )}
      </div>
      <div>
        {pageLoaded && mapsLoaded ? (
          <div>
            <div className="flex flex-col items-center z-[99] self-center justify-center w-screen p-4 mx-auto overflow-hidden bg-gray-100 rounded-lg shadow-lg xs:w-96 lg:absolute -top-96 lg:mt-0 lg:top-40 lg:right-10 grow ">
              <div className="self-center justify-center text-lg text-gray-900 ">
                Pick me up from:
              </div>
              <div className="flex flex-col items-center">
                <div className="flex flex-col self-center justify-center ">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setPickup("Address")}
                      type="button"
                      className="flex items-center self-center gap-4 my-2 btn green">
                      Address
                      <FaMapMarkerAlt className="z-0 text-xl" />
                    </button>
                    <button
                      onClick={() => setPickup("Airport")}
                      type="button"
                      className="flex items-center self-center gap-4 my-2 btn pink">
                      Airport
                      <FaPlaneDeparture className="z-0 text-xl" />
                    </button>
                  </div>
                  <button
                    aria-label="Your location"
                    type="button"
                    onClick={getLocation}
                    className="flex items-center self-center gap-4 px-4 py-1 my-2 btn ">
                    My location
                    <FaCrosshairs className="z-0 self-center" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-start w-80 ">
                <label
                  htmlFor="location"
                  className="self-start justify-start text-base font-medium text-gray-900">
                  Pickup
                </label>
                {/* {originError && (
                  <p className="px-2 text-white bg-red-400 rounded-lg w-max">
                    Incorrect location
                  </p>
                )} */}

                {
                  <div className="input">
                    {" "}
                    <span>
                      {isPickupAirport ? (
                        <FaPlaneDeparture className="z-[0]" />
                      ) : (
                        <FaMapMarkerAlt className="z-[0]" />
                      )}
                    </span>
                    <div
                      className={` w-full ${
                        !isPickupAirport ? "flex" : "hidden"
                      }`}>
                      <input
                        onBlur={handleChangeOrigin}
                        id="location"
                        value={location}
                        onChange={handleChangeOrigin}
                        ref={originInputRef as any}
                        type="text"
                        placeholder="Enter your location"
                        className="field left"
                      />
                    </div>
                    <div
                      aria-hidden={isPickupAirport ? "false" : "true"}
                      className={isPickupAirport ? "flex w-full" : "hidden"}>
                      <AirportSelect
                        ref={airportSelectOriginRef}
                        which="location"
                      />
                    </div>
                    {/* {google &&<LocationAutocomplete google={google} />} */}
                  </div>
                }

                {
                  <>
                    <label
                      htmlFor="destination">
                      Dropoff
                    </label>

                    <div className="input">
                      {" "}
                      <span>
                        {!isPickupAirport ? (
                          <FaPlaneDeparture className="z-[0]" />
                        ) : (
                          <FaMapPin className="z-[0]" />
                        )}
                      </span>
                      <div
                        className={!isPickupAirport ? "flex w-full" : "hidden"}>
                        <AirportSelect
                          ref={airportSelectDestinationRef}
                          which="destination"
                        />
                      </div>
                      <div
                        className={`w-full ${
                          isPickupAirport ? "flex" : "hidden"
                        }`}>
                        <input
                          onBlur={handleChangeDestination}
                          onChange={handleChangeDestination}
                          value={destination}
                          ref={destinationInputRef as any}
                          type="text"
                          placeholder="Enter your destination"
                          className="field"
                        />
                      </div>
                      {/* {google && <DestinationAutocomplete google={google} />} */}
                    </div>
                  </>
                }
                <label
                  htmlFor="passengers"
                  className="self-start justify-start w-full text-base font-medium text-gray-900">
                  Passengers
                  <StepperInput />
                </label>
              </div>

              <Formik
                initialValues={{
                  date,
                  time,
                }}
                validationSchema={Yup.object().shape({
                  date: Yup.date().required("Pickup date is required"),
                  time: Yup.string().required("Pickup time is required"),
                })}
                // eslint-disable-next-line react/jsx-no-bind
                onSubmit={handleSearch}>
                {({ isSubmitting, errors, touched }) => (
                  <FormikForm id="form" className="flex flex-col items-center w-80">
                    <>
                      {" "}
                      <label
                        htmlFor="date"
                        className="self-start justify-start text-base font-medium text-gray-900">
                        Pickup Date
                      </label>
                      <div className="input">
                        <div className="flex flex-row w-full border-gray-900 rounded-lg col-span-3 border-1">
                          {" "}
                          <span>
                            <BsCalendarFill className="z-[0]" />
                          </span>
                          <Field
                            id="date"
                            name="date"
                            type="date"
                            className="field left"
                          />
                          {errors.date && touched.date && (
                            <div className="absolute h-10 text-sm font-medium text-pink-500 rounded-lg pointer-events-none w-80 ring-2 ring-pink-400">
                              <p
                                aria-live="polite"
                                className="relative px-2 text-white bg-pink-400 rounded-lg left-1 -top-3 w-max">
                                {errors.date}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                    <>
                      {" "}
                      <label
                        htmlFor="time"
                        className="self-start justify-start text-base font-medium text-gray-900">
                        Pickup Time
                      </label>
                      <div className="input">
                        <div className="flex flex-row w-full border-gray-900 rounded-lg col-span-3 border-1">
                          {" "}
                          <span className="inline-flex items-center px-3 text-lg shadow rounded-l-md bg-sky-500 text-gray-50">
                            <BsClockFill className="z-[0]" />
                          </span>
                          <Field
                            id="time"
                            name="time"
                            type="time"
                            className="field left"
                          />
                          {errors.time && touched.time && (
                            <div className="absolute h-10 text-sm font-medium text-pink-500 rounded-lg pointer-events-none w-80 ring-2 ring-pink-400">
                              <p className="relative px-2 text-white bg-pink-400 rounded-lg left-1 -top-3 w-max">
                                {errors.time}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                    <div className="flex items-start w-full my-4 gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="bg-transparent border border-gray-400 rounded-sm"
                          checked={flight_monitoring}
                          onChange={handleAddFlightMonitoring}
                          id="flightMonitoring"
                        />
                        <Label
                          htmlFor="flightMonitoring"
                          className="text-base text-gray-800">
                          Add Flight Monitoring
                        </Label>
                      </div>{" "}
                    </div>
                    <div className="flex flex-row mx-1 rounded-lg w-80">
                      <button
                        disabled={loading}
                        type="submit"
                        // data-callback='onSubmit'
                        // data-action='submit'
                        // data-sitekey={process.env.NEXT_PUBLIC_CAPTCHA_KEY}
                        className="btn lg w-72 mx-auto">
                        Search
                      </button>
                    </div>
                  </FormikForm>
                )}
              </Formik>
            </div>
          </div>
        ) : (
          <div className="flex items-center self-center justify-center mx-auto lg:absolute -top-96 lg:mt-0 lg:top-40 lg:right-10">
            <div className="flex p-4 bg-white shadow rounded-md">
              <div className="flex flex-col justify-between p-4 gap-6 w-80">
                <div
                  data-placeholder
                  className="h-8 overflow-hidden bg-gray-200 rounded-lg "
                />
                <div
                  data-placeholder
                  className="h-8 overflow-hidden bg-gray-200 rounded-lg"
                />
                <div
                  data-placeholder
                  className="w-40 h-8 overflow-hidden bg-gray-200 rounded-lg"
                />
                <div
                  data-placeholder
                  className="h-8 overflow-hidden bg-gray-200 rounded-lg"
                />
                <div
                  data-placeholder
                  className="h-8 overflow-hidden bg-gray-200 rounded-lg"
                />
                <div className="flex flex-row justify-between overflow-hidden gap-2">
                  <div
                    data-placeholder
                    className="w-32 h-8 overflow-hidden bg-gray-200 rounded-lg"
                  />
                  <div
                    data-placeholder
                    className="w-32 h-8 overflow-hidden bg-gray-200 rounded-lg"
                  />
                </div>
                <div
                  data-placeholder
                  className="self-center w-64 h-8 overflow-hidden bg-gray-200 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        [data-placeholder]::after {
          content: " ";
          box-shadow: 0 0 90px 40px rgba(254, 254, 254);
          position: relative;
          top: 0;
          left: -100%;
          height: 100%;
          animation: load 1.2s infinite;
        }
        @keyframes load {
          0% {
            left: -100%;
          }
          100% {
            left: 150%;
          }
        }
      `}</style>
    </div>
  );
}
export default Form;
