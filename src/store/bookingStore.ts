import {create} from "zustand";
import { persist } from "zustand/middleware";
import { Loader } from "@googlemaps/js-api-loader";
export interface BookingData {
  status: string;
  id: string;
  location: string;
  destination: string;
  passengers: number;
  date: string;
  time: string;
  flight_number: string;
  distance: string;
  service: string;
  plane_arriving_from: string;
  airline_name: string;
  duration: string;
  payment: string;
  flight_monitoring: boolean;
  instructions: string;
  showSummary: boolean;
  distanceValue: number;
  setLocation: (location: string) => void;
  setDestination: (destination: string) => void;
  setPassengers: (passengers: number) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setFlightNumber: (flight_number: string) => void;
  setDistance: (distance: string) => void;
  setService: (service: string) => void;
  setPlaneArrivingFrom: (plane_arriving_from: string) => void;
  setAirlineName: (airline_name: string) => void;
  setDuration: (duration: string) => void;
  setPayment: (payment: string) => void;
  setFlightMonitoring: (flight_monitoring: boolean) => void;
  setInstructions: (instructions: string) => void;
  setId: (id: string) => void;
  setShowSummary: (showSummary: boolean) => void;
  setDistanceValue: (distanceValue: number) => void;
}
interface SecureData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  price_per_mile: number;
  user_id: string;
  total_trip_price: number;
  google: any;
  setFirstName: (first_name: string) => void;
  setLastName: (last_name: string) => void;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setPricePerMile: (price_per_mile: number) => void;
  setUserId: (user_id: string) => void;
  setTotalTripPrice: (total_trip_price: number) => void;
  setGoogle: (google: any) => void;
}

export const bookingStore = create<BookingData>()(
  persist<BookingData>((set) => ({
    id: "",
    location: "",
    destination: "",
    passengers: 1,
    date: "",
    time: "",
    flight_number: "",
    distance: "",
    service: "",
    plane_arriving_from: "",
    airline_name: "",
    duration: "",
    payment: "",
    flight_monitoring: false,
    instructions: "",
    status: "",
    showSummary: false,
    distanceValue: 0,
    setLocation: (location) => set({ location }),
    setDestination: (destination) => set({ destination }),
    setPassengers: (passengers) => set({ passengers }),
    setDate: (date) => set({ date }),
    setTime: (time) => set({ time }),
    setFlightNumber: (flight_number) => set({ flight_number }),
    setDistance: (distance) => set({ distance }),
    setService: (service) => set({ service }),
    setPlaneArrivingFrom: (plane_arriving_from) => set({ plane_arriving_from }),
    setAirlineName: (airline_name) => set({ airline_name }),
    setDuration: (duration) => set({ duration }),
    setPayment: (payment) => set({ payment }),
    setFlightMonitoring: (flight_monitoring) => set({ flight_monitoring }),
    setInstructions: (instructions) => set({ instructions }),
    setShowSummary: (showSummary) => set({ showSummary }),
    setId: (id) => set({ id }),
    setDistanceValue: (distanceValue) => set({ distanceValue }),
  }),{
    name: "booking",
  })
);

export const secureStore = create<SecureData>()((set) => ({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  total_trip_price: 0,
  price_per_mile: 4,
  user_id: "",
  google: null,
  setFirstName: (first_name) => set({ first_name }),
  setLastName: (last_name) => set({ last_name }),
  setEmail: (email) => set({ email }),
  setPhone: (phone) => set({ phone }),
  setTotalTripPrice: (total_trip_price) => set({ total_trip_price }),
  setPricePerMile: (price_per_mile) => set({ price_per_mile }),
  setUserId: (user_id) => set({ user_id }),
  setGoogle: (google) => set({ google }),
}));
