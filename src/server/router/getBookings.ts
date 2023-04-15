/* eslint-disable consistent-return */
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { z } from "zod";
import { Booking } from "../../pages/b/[id]";
import { logRequest } from "../../utils/helpers";
import { getServiceSupabase } from "../../utils/supabaseClient";
import { createRouter } from "./context";

export const getBookings = createRouter()
  .query("single", {
    input: z.object({
      id: z.string(),
      secret: z.string().min(64),
    }),

    async resolve({ input, ctx }) {
      const supabase = getServiceSupabase();
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", input.id);
      if (data) return data;
      if (error) return error;
      return TRPCError;
    },
  })
  .mutation("create", {
    input: z.object({
      user_id: z.string().optional(),
      first_name: z.string(),
      last_name: z.string(),
      email: z.string().email(),
      phone: z.string(),
      return_first_name: z.string().optional(),
      return_last_name: z.string().optional(),
      return_email: z.string().optional(),
      return_phone: z.string().optional(),
      location: z.string(),
      destination: z.string(),
      passengers: z.number(),
      date: z.string(),
      time: z.string(),
      return_date: z.string().optional(),
      return_time: z.string().optional(),
      flight_number: z.string().optional(),
      distance: z.string(),
      service: z.string(),
      // payment: z.string(),
      return_service: z.string().optional(),
      airline_name: z.string().optional(),
      plane_arriving_from: z.string().optional(),
      return_location: z.string().optional(),
      return_destination: z.string().optional(),
      return_distance: z.string().optional(),
      total_trip_price: z.string(),
      instructions: z.string().optional(),
      status: z.string(),
    }),
    async resolve({ input, ctx }) {
      logRequest(ctx.req, input);
      const today = dayjs();
      const dateAndTime = dayjs(`${input.date} ${input.time}`);
      const returnDateAndTime = dayjs(
        `${input.return_date} ${input.return_time}`
      );
      if (!dateAndTime.isAfter(today)) {
        console.log("date is not after today");
        throw new TRPCError({
          message: "Please enter a valid date.",
          code: "BAD_REQUEST",
        });
      }
      if (
        input.return_date &&
        input.return_time &&
        !returnDateAndTime.isAfter(dateAndTime)
      ) {
        console.log("return date is not after today");

        throw new TRPCError({
          message: "Return date cannot be before departure date.",
          code: "BAD_REQUEST",
        });
      }

      if (parseInt(input.distance, 10) < 0.5 || input.distance.includes("ft")) {
        throw new TRPCError({
          message:
            "Your trip is too short. Please enter a distance greater than 1 mile.",
          code: "BAD_REQUEST",
        });
      }
      //if distance is greater than 100 miles, return error.
      if (parseInt(input.distance, 10) > 100) {
        throw new TRPCError({
          message:
            "Your trip is too long. Please enter a distance less than 100 miles.",
          code: "BAD_REQUEST",
        });
      }

      const supabase = getServiceSupabase();

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          ...(input.user_id && { user_id: input.user_id }),
          id: nanoid(),
          first_name: input.first_name,
          last_name: input.last_name,
          email: input.email,
          phone: input.phone,
          return_first_name: input.return_first_name,
          return_last_name: input.return_last_name,
          return_email: input.return_email,
          return_phone: input.return_phone,
          location: input.location,
          destination: input.destination,
          passengers: input.passengers,
          date: input.date,
          time: input.time,
          return_date: input.return_date,
          return_time: input.return_time,
          flight_number: input.flight_number,
          distance: input.distance,
          service: input.service,
          // payment: input.payment,
          return_service: input.return_service,
          airline_name: input.airline_name,
          plane_arriving_from: input.plane_arriving_from,
          return_location: input.return_location,
          return_destination: input.return_destination,
          // return_distance: input.return_distance,
          total: input.total_trip_price,
          instructions: input.instructions,
          status: input.status,
          secret: nanoid(64),
        })
        .select();
      console.log(data, error);
      if (data) return data;
      if (error)
        throw new TRPCError({
          message: "Something went wrong, please try again",
          code: "INTERNAL_SERVER_ERROR",
        });
      throw TRPCError;
    },
  })
  .query("verify", {
    input: z.object({
      secret: z.string(),
    }),
    async resolve({ input, ctx }) {
      if (!input.secret) {
        throw new TRPCError({
          message: "Please enter a secret",
          code: "BAD_REQUEST",
        });
      }
      const supabase = getServiceSupabase();
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("secret", input.secret);
      if (data?.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      if (data && data.length > 0) return data;
      if (error)
        throw new TRPCError({
          message: error.message,
          code: error.code === "404" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
        });
    },
  })
  .mutation("update", {
    input: z.object({
      id: z.string().optional(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      return_first_name: z.string().optional(),
      return_last_name: z.string().optional(),
      return_email: z.string().optional(),
      return_phone: z.string().optional(),
      location: z.string().optional(),
      destination: z.string().optional(),
      passengers: z.number().optional(),
      date: z.string().optional(),
      time: z.string().optional(),
      return_date: z.string().optional(),
      return_time: z.string().optional(),
      flight_number: z.string().optional(),
      distance: z.string().optional(),
      service: z.string().optional(),
      // payment: z.string().optional(),
      return_service: z.string().optional(),
      airline_name: z.string().optional(),
      plane_arriving_from: z.string().optional(),
      return_location: z.string().optional(),
      return_destination: z.string().optional(),
      return_distance: z.string().optional(),
      total_trip_price: z.string().optional(),
      instructions: z.string().optional(),
      status: z.string().optional(),
      checkout_session: z.string().optional(),
      secret: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      const supabase = getServiceSupabase();
      const {
        id,
        first_name,
        last_name,
        email,
        phone,
        return_first_name,
        return_last_name,
        return_email,
        return_phone,
        location,
        destination,
        passengers,
        date,
        time,
        return_date,
        return_time,
        flight_number,
        distance,
        service,
        // payment,
        return_service,
        airline_name,
        plane_arriving_from,
        return_location,
        return_destination,
        return_distance,
        total_trip_price,
        instructions,
        status,
        checkout_session,
        secret,
      } = input;

      if (!id) {
        throw new TRPCError({
          message: "Please enter a valid id",
          code: "BAD_REQUEST",
        });
      }

      //only select the fields that are not undefined
      const fields = {
        ...(first_name && { first_name }),
        ...(last_name && { last_name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(return_first_name && { return_first_name }),
        ...(return_last_name && { return_last_name }),
        ...(return_email && { return_email }),
        ...(return_phone && { return_phone }),
        ...(location && { location }),
        ...(destination && { destination }),
        ...(passengers && { passengers }),
        ...(date && { date }),
        ...(time && { time }),
        ...(return_date && { return_date }),
        ...(return_time && { return_time }),
        ...(flight_number && { flight_number }),
        ...(distance && { distance }),
        ...(service && { service }),
        // ...(payment && { payment }),
        ...(return_service && { return_service }),
        ...(airline_name && { airline_name }),
        ...(plane_arriving_from && { plane_arriving_from }),
        ...(return_location && { return_location }),
        ...(return_destination && { return_destination }),
        ...(return_distance && { return_distance }),
        ...(total_trip_price && { total_trip_price }),
        ...(instructions && { instructions }),
        ...(status && { status }),
        ...(checkout_session && { checkout_session }),
        ...(secret && { secret }),
      };
      const { data, error } = await supabase
        .from("bookings")
        .update(fields)
        .eq("id", input.id);
      if (data) return data;
      if (error)
        throw new TRPCError({
          message: error.message,
          code: "INTERNAL_SERVER_ERROR",
        });
      throw TRPCError;
    },
  });
