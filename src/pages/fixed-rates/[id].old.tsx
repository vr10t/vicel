/* eslint-disable jsx-a11y/label-has-associated-control */
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { SetStateAction, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { Button, Input, Text } from "@nextui-org/react";
import { FaMapMarkerAlt } from "@react-icons/all-files/fa/FaMapMarkerAlt";
import { Formik } from "formik";
import * as Yup from "yup";
import { BsCalendarFill } from "@react-icons/all-files/bs/BsCalendarFill";
import { BsClockFill } from "@react-icons/all-files/bs/BsClockFill";
import { HiSwitchVertical } from "@react-icons/all-files/hi/HiSwitchVertical";
import { Label, Dropdown } from "flowbite-react";
import ContactDetails from "../../components/Booking/ContactDetails";
import FlightMonitoring from "../../components/Booking/FlightMonitoring";
import Service from "../../components/Booking/Service";
import { bookingStore, secureStore } from "../../store/bookingStore";
import userStore from "../../store/user";
import { supabase } from "../../utils/supabaseClient";
import Layout from "../../components/Layout";
import StepperInput from "../../components/Booking/StepperInput";
import Summary from "../../components/Booking/SummaryLg";
import { trpc } from "../../utils/trpc";

export default function Booking() {
  const router = useRouter();
  const { id } = router.query;
  const {
    distance,
    duration,
    location,
    destination,
    service,
    date,
    time,
    setDistance,
    setLocation,
    setDestination,
    setDuration,
    setService,
    setDate,
    setTime,
    passengers,
    return_passengers,
    setPassengers,
    instructions,
    setInstructions,
    flight_monitoring,
    setFlightMonitoring,
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
  const originInputRef = useRef<HTMLInputElement>();
  const destinationInputRef = useRef<HTMLInputElement>();
  const [bounds, setBounds] = useState<any>();
  const [searchOptions, setSearchOptions] = useState<any>();
  const [autocompleteLocation, setAutocompleteLocation] =
    useState<google.maps.places.Autocomplete>();
  const [autocompleteDestination, setAutocompleteDestination] =
    useState<google.maps.places.Autocomplete>();

  const locations = id?.toString().split("-to-") ?? [];

  const { data: fixedPrices } = trpc.useQuery(["price.fixed"]);
  const [standard, setStandard] = useState<number>(0);
  const [pc, setPc] = useState<number>(0);
  const [mpv, setMpv] = useState<number>(0);

  const [isNight, setIsNight] = useState(false);

  const getDistance = trpc.useMutation(["distance.get"], {
    onSuccess: async (data) => {
      if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
        setDistance(data.rows[0].elements[0].distance.text);
        setDuration(data.rows[0].elements[0].duration_in_traffic.text);
        return;
      }
      setDistance("error");
      setDuration("error");
    },
  });

  useEffect(() => {
    setIsNight(
      dayjs(`${date} ${time}`).hour() > 22 ||
        dayjs(`${date} ${time}`).hour() < 7
    );
  }, [time, date, dayjs]);

  const airport: { [index: string]: any } | null =
    fixedPrices?.find((item) =>
      item.name?.toLowerCase().includes(locations[1].toLowerCase())
    ) ?? null;

  useEffect(() => {
    if (fixedPrices) {
      if (airport) {
        const placeStandard = Object.keys(airport).find((key) =>
          key.includes(
            `${
              locations[0].split(" ")[0].toLowerCase().length < 3
                ? locations[0].split(" ")[1].toLowerCase()
                : locations[0].split(" ")[0].toLowerCase()
            }S`
          )
        );
        const placePC = Object.keys(airport).find((key) =>
          key.includes(
            `${
              locations[0].split(" ")[0].toLowerCase().length < 3
                ? locations[0].split(" ")[1].toLowerCase()
                : locations[0].split(" ")[0].toLowerCase()
            }P`
          )
        );
        const placeMPV = Object.keys(airport).find((key) =>
          key.includes(
            `${
              locations[0].split(" ")[0].toLowerCase().length < 3
                ? locations[0].split(" ")[1].toLowerCase()
                : locations[0].split(" ")[0].toLowerCase()
            }M`
          )
        );
        if (placeStandard) {
          if (isNight) {
            setStandard(airport[placeStandard] * 1.2);
          } else {
            setStandard(airport[placeStandard]);
          }
        }
        if (placePC) {
          if (isNight) {
            setPc(airport[placePC] * 1.2);
          } else {
            setPc(airport[placePC]);
          }
        }
        if (placeMPV) {
          if (isNight) {
            setMpv(airport[placeMPV] * 1.2);
          } else {
            setMpv(airport[placeMPV]);
          }
        }
      }
    }
  }, [fixedPrices, locations, isNight, airport]);

  useEffect(() => {
    if (airport) {
      setLocation(locations[0]);
      setDestination(airport.name);
      getDistance.mutate({
        location: locations[0],
        destination: airport.name,
      });
    }
  }, [airport]);

  useEffect(() => {
    switch (service) {
      case "Standard":
        setTotalTripPrice(standard);
        break;
      case "PC":
        setTotalTripPrice(pc);
        break;
      case "MPV":
        setTotalTripPrice(mpv);
        break;
      default:
        setTotalTripPrice(standard ?? 0);
        break;
    }
  }, [service, standard, pc, mpv]);

  const [inputIsOrigin, setInputIsOrigin] = useState(true);

  useEffect(() => {
    if (!google) return;
    if (!originInputRef.current || !destinationInputRef.current) return;

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
  }, [google]);

  useEffect(() => {
    if (!originInputRef.current) return;
    if (!destinationInputRef.current) return;
    setAutocompleteLocation(
      new google.maps.places.Autocomplete(
        originInputRef.current,

        searchOptions
      )
    );
    setAutocompleteDestination(
      new google.maps.places.Autocomplete(
        destinationInputRef.current,
        searchOptions
      )
    );
  }, [searchOptions]);

  const { user } = userStore();
  const [loading, setLoading] = useState(false);
  const termsRef = useRef<HTMLInputElement>(null);
  const [serviceSelected, setServiceSelected] = useState<string | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    if (passengers <= 3) {
      setService("Standard");
      setServiceSelected("Standard");
    }
    if (passengers > 3) {
      setService("PC");
      setServiceSelected("PC");
    }
    if (passengers > 6) {
      setService("MPV");
      setServiceSelected("MPV");
    }
  }, [passengers]);

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
      phone &&
      isPossiblePhoneNumber(phone)
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
  const handleSelectService = (e: any): void => {
    const target = e.target as HTMLFormElement;
    if (target.id !== "") {
      setServiceSelected(target.id);
      setService(target.id);
      switch (target.id) {
        case "Standard":
          setTotalTripPrice(standard);
          break;
        case "PC":
          setTotalTripPrice(pc);
          break;
        case "MPV":
          setTotalTripPrice(mpv);
          break;
        default:
          setTotalTripPrice(0);
          break;
      }
    }
  };

  async function submitBoookingForUser() {
    router.push(
      `/booking/summary?first_name=${first_name}&last_name=${last_name}&email=${email}&phone=${phone}&price=${total_trip_price}&dest=${id}
    `,
      "/booking/summary"
    );
  }

  async function handleBooking() {
    toast.remove();
    const today = dayjs();
    const dateAndTime = dayjs(`${date} ${time}`);
    if (!dateAndTime.isAfter(today)) {
      toast.error("Please enter a valid date.");
      return;
    }

    if (parseFloat(distance) < 0.5 || distance.includes("ft")) {
      toast.error(
        "Your trip is too short. Please enter a distance greater than 1 mile."
      );
      return;
    }
    //if distance is greater than 100 miles, return error.
    if (parseFloat(distance) > 100) {
      toast.error(
        "Your trip is too long. Please enter a distance less than 100 miles."
      );
      return;
    }
    setLoading(true);
    submitBoookingForUser();
    setLoading(false);
  }

  useEffect(() => {
    setServiceSelected(service);
  }, [service]);

  function handleAddFlightMonitoring(event: any) {
    setFlightMonitoring(event.target.checked);
  }

  useEffect(() => {
    autocompleteLocation?.addListener("place_changed", () => {
      const place = autocompleteLocation.getPlace();
      const strings = place.address_components?.map(
        (component) => component.long_name
      );
      const set = new Set(strings);
      const address = Array.from(set).join(", ");
      setLocation(place.formatted_address ?? address ?? "");
      getDistance.mutate({
        location: place.formatted_address ?? address ?? location,
        destination,
      });
    });
    return () => {
      autocompleteLocation?.unbindAll();
    };
  }, [autocompleteLocation, google]);

  useEffect(() => {
    autocompleteDestination?.addListener("place_changed", () => {
      const place = autocompleteDestination.getPlace();
      const strings = place.address_components?.map(
        (component) => component.long_name
      );
      const set = new Set(strings);
      const address = Array.from(set).join(", ");
      setDestination(place.formatted_address ?? address ?? "");
      getDistance.mutate({
        location,
        destination: place.formatted_address ?? address ?? destination,
      });
    });
    return () => {
      autocompleteDestination?.unbindAll();
    };
  }, [autocompleteDestination, google]);

  const [dropdownItems, setDropdownItems] = useState<
    { key: number; name: string }[]
  >([]);

  useEffect(() => {
    switch (airport?.key) {
      case "heathrow":
        setDropdownItems([
          { key: 1, name: "Terminal 1" },
          { key: 2, name: "Terminal 2" },
          { key: 3, name: "Terminal 3" },
          { key: 4, name: "Terminal 4" },
          { key: 5, name: "Terminal 5" },
        ]);
        break;
      case "gatwick":
        setDropdownItems([
          { key: 1, name: "North Terminal" },
          { key: 2, name: "South Terminal" },
        ]);
        break;
      default:
        setDropdownItems([]);
        break;
    }
  }, [airport]);

  function handleTerminalChange(item: { key: number; name: string }) {
    setDestination(`${airport?.name}, ${item.name}`);
  }

  function switchLocations() {
    setInputIsOrigin(!inputIsOrigin);
    const tempLocation = location;
    const tempDestination = destination;
    setLocation(tempDestination);
    setDestination(tempLocation);
  }

  return (
    <Layout
      title={id ? id.toString().replaceAll("-", " ") : ""}
      description="Book your airport transfer with us. We offer a reliable and affordable service to and from all major airports in the UK.">
      <div className="flex flex-col justify-center w-full p-4 xl:flex-row gap-2 xl:px-32">
        <div className="flex flex-col items-center justify-center ">
          <div className="flex flex-col items-center justify-center w-full max-w-xl gap-2">
            <div className="flex items-center justify-center w-full gap-2">
              <div className="flex flex-col items-center justify-center w-full gap-2">
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <p className="label">From:</p>
                  <div
                    className={`${
                      inputIsOrigin ? "!hidden" : "flex"
                    } justify-center w-full px-3 py-1 my-2 text-center rounded-lg shadow bg-gray-50 `}>
                    <Text h3 size="$2xl">
                      {location}
                    </Text>
                  </div>
                  <div
                    className={`${
                      inputIsOrigin ? "flex" : "!hidden"
                    } input full `}>
                    {" "}
                    <span>
                      <FaMapMarkerAlt className="z-[0]" />
                    </span>
                    <div
                      className={` w-full ${
                        inputIsOrigin ? "flex" : "hidden"
                      }`}>
                      <input
                        id={inputIsOrigin ? "location" : "destination"}
                        ref={originInputRef as any}
                        value={inputIsOrigin ? location : destination}
                        onChange={(e) => {
                          if (inputIsOrigin) {
                            setLocation(e.target.value);
                          } else {
                            setDestination(e.target.value);
                          }
                        }}
                        className="field left"
                        type="text"
                        placeholder={`Enter your ${
                          inputIsOrigin ? "pickup address" : "destination"
                        }`}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center w-full h-full mb-4">
                  <p className="label">To:</p>
                  <div
                    className={`${
                      inputIsOrigin ? "flex" : "!hidden"
                    } justify-center w-full px-3 py-1 my-2 text-center rounded-lg shadow bg-gray-50 `}>
                    <Text h3 size="$2xl">
                      {destination}
                    </Text>
                  </div>
                  <div
                    className={`${
                      inputIsOrigin ? "!hidden" : "flex"
                    } input full `}>
                    {" "}
                    <span>
                      <FaMapMarkerAlt className="z-[0]" />
                    </span>
                    <div className={` w-full ${"flex"}`}>
                      <input
                        id={inputIsOrigin ? "location" : "destination"}
                        ref={destinationInputRef as any}
                        value={inputIsOrigin ? location : destination}
                        onChange={(e) => {
                          if (inputIsOrigin) {
                            setLocation(e.target.value);
                          } else {
                            setDestination(e.target.value);
                          }
                        }}
                        className="field left"
                        type="text"
                        placeholder={`Enter your ${
                          inputIsOrigin ? "pickup address" : "destination"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 items-center justify-center">
                    {dropdownItems.length > 0 && (
                      <Dropdown
                        color="alternative"
                        className="z-[99]"
                        label="Terminal">
                        {dropdownItems.map((item) => (
                          <Dropdown.Item
                            key={item.key}
                            onClick={() => {
                              handleTerminalChange(item);
                            }}>
                            {item.name}
                          </Dropdown.Item>
                        ))}
                      </Dropdown>
                    )}
                    <button type="button" onClick={switchLocations} className="btn">
                      {" "}
                      Switch Locations
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <label
              htmlFor="passengers"
              className="label self-start w-full">
              Passengers
              <StepperInput />
            </label>

            <Formik
              initialValues={{
                date,
                time,
              }}
              validationSchema={Yup.object().shape({
                date: Yup.date().required("Pickup date is required"),
                time: Yup.string().required("Pickup time is required"),
              })}
              onSubmit={() => undefined}
              // eslint-disable-next-line react/jsx-no-bind
            >
              {({ isSubmitting, errors, touched }) => (
                <form id="form" className="flex flex-col items-center w-full">
                  {" "}
                  <label
                    htmlFor="date"
                    className="label self-start">
                    Pickup Date
                  </label>
                      {errors.date && touched.date && (
                        <div className="warning">
                          <p
                            aria-live="polite">
                            {errors.date}
                          </p>
                        </div>
                      )}
                  <div className="flex justify-between w-full my-2 gap-2">
                    <div className="input full">
                      {" "}
                      <span>
                        <BsCalendarFill className="z-[0]" />
                      </span>
                      <input
                        id="date"
                        className="field left"
                        name="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </div>{" "}
                  <label
                    htmlFor="time"
                    className="label self-start">
                    Pickup Time
                  </label>
                      {errors.time && touched.time && (
                        <div className="warning">
                          <p>
                            {errors.time}
                          </p>
                        </div>
                      )}
                  <div className="flex justify-between w-full my-2 gap-2 ">
                    <div className="input full">
                      {" "}
                      <span>
                        <BsClockFill className="z-[0]" />
                      </span>
                      <input
                        id="time"
                        className="field left"
                        name="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex my-4 gap-2">
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
                </form>
              )}
            </Formik>
          </div>

          <form
            // eslint-disable-next-line
            role="listbox"
            onKeyDown={handleSelectService}
            onClick={handleSelectService}
            className="">
            <div className="label lg">
              CHOOSE YOUR SERVICE
            </div>
            {passengers <= 3 && (
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
                passengers="3"
                luggage="3"
                selected={serviceSelected === "Standard"}>
                <div className="flex flex-col items-center justify-center">
                  <p className="max-w-xs px-2 text-sm text-gray-600">
                    Saloon car with standard service. Includes up to 3
                    passengers and 3 luggage.
                  </p>
                </div>
              </Service>
            )}

            {passengers <= 6 && (
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
                passengers="6"
                luggage="6"
                selected={serviceSelected === "PC"}>
                <div className="flex flex-col items-center justify-center">
                  <p className="max-w-xs px-2 text-sm text-gray-600">
                    Family size vehicle with premium service. Includes up to 6
                    passengers and 6 luggage.
                  </p>
                </div>
              </Service>
            )}

            {passengers <= 8 && (
              <Service
                name="MPV"
                htmlFor="MPV"
                image={
                  <Image src="/MPV.webp" width={1200} height={960} alt="MPV" />
                }
                passengers="8"
                luggage="8"
                selected={serviceSelected === "MPV"}>
                <div className="flex flex-col items-center justify-center">
                  <p className="max-w-xs px-2 text-sm text-gray-600">
                    Large vehicle suitable for groups. Includes up to 8
                    passengers and 8 luggage.
                  </p>
                </div>
              </Service>
            )}
          </form>

          <section className="w-full max-w-xl mb-2">
            <div className="flex items-stretch w-full text-lg font-medium tracking-wider text-gray-600 bg-gray-100">
              <p className="grow label lg"> PASSENGER DETAILS</p>
              {!user && (
                <span className="flex self-center font-light tracking-tight text-md">
                  <p className="mr-2 "> or </p>
                  <Link href="/sign-in?referrer=/booking">
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a className="underline text-sky-600 hover:text-sky-400">
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
          <div className="w-full max-w-xl mb-2">
            {flight_monitoring && <FlightMonitoring />}
          </div>
          <section className="w-full max-w-xl">
            <div className="label lg mb-4">
              SPECIAL INSTRUCTIONS
            </div>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="field h-32"
            />
          </section>
        </div>
        <div className="flex flex-col items-center w-full mb-10">
          {google && (
            <Summary
              isNight={isNight}
              onSubmit={() => handleBooking()}
              disabled={!canSubmit}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
