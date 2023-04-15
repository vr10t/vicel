import { Session, User } from "@supabase/supabase-js";

export interface AppData {
  return_duration: string;
  return_distance: string;
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  return_first_name: string;
  return_last_name: string;
  return_email: string;
  return_phone: string;
  location: string;
  destination: string;
  passengers: string;
  date: string;
  time: string;
  return_date: string;
  flight_number: string;
  distance: string;
  service: string;
  return_time: string;
  plane_arriving_from: string;
  airline_name: string;
  return_location: string;
  return_destination: string;
  total_trip_price: number;
  duration:string;
  payment:string;
  return:boolean,
  flight_monitoring:boolean,
  instructions:string,
  return_instructions:string,
  return_passengers:string,
 price_per_mile:number,
  user_id:string,
  return_service:string,
}

export interface ExtendedUser extends User {
  stripe_customer: string;
  first_name: string;
  last_name: string;
  phone: string;
  email:string;
  bookings: string[];
}
