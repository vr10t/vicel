import { TRPCError } from "@trpc/server";
import { z } from "zod";
import UAParser from "ua-parser-js";
import { createRouter } from "./context";
import { logRequest } from "../../utils/helpers";

export interface Distance {
  text: string;
  value: number;
}

export interface Duration {
  text: string;
  value: number;
}

export interface DurationInTraffic {
  text: string;
  value: number;
}
export interface Element {
  distance: Distance;
  duration: Duration;
  duration_in_traffic: DurationInTraffic;
  status: string;
}
export interface Row {
  elements: Element[];
}
export interface DistanceMatrix {
  destination_addresses: string[];
  origin_addresses: string[];
  rows: Row[];
  status: string;
}

export const distance = createRouter().mutation("get", {
  input: z.object({
    location: z
      .string()
      .min(3, "The pickup address must be at least 3 characters"),
    destination: z
      .string()
      .min(3, "The dropoff address must be at least 3 characters"),
    dateTime: z.date().nullish(),
  }),

  async resolve({ input, ctx }) {
    // if(!ctx.user) throw new TRPCError({message: "Unauthorized",code: "UNAUTHORIZED"})
    logRequest(ctx.req, input);
    const { location, destination, dateTime } = input;

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${location}&destinations=${destination}&departure_time=now&key=${process.env.SECRET_GOOGLE_API_KEY}`
    );

    const data = await res.json();
    console.log(data, "data");
    if (data.status === "OK") {
      if (data.rows[0].elements[0].status === "OK") {
        return data as DistanceMatrix;
      }
      if (data.rows[0].elements[0].status === "NOT_FOUND") {
        throw new TRPCError({
          message:
            "We could not find the address you entered. Please try again.",
          code: "NOT_FOUND",
        });
      }
      if (data.rows[0].elements[0].status === "ZERO_RESULTS") {
        throw new TRPCError({
          message:
            "We could not find a route. Please make sure the locations are correct.",
          code: "NOT_FOUND",
        });
      }
    }
    throw new TRPCError({
      message: "Error getting distance. Please try again",
      code: "INTERNAL_SERVER_ERROR",
    });
  },
});
