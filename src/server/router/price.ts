import { z } from "zod";
import { inferAsyncReturnType, TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { createRouter } from "./context";
import { getServiceSupabase } from "../../utils/supabaseClient";
import { logRequest } from "../../utils/helpers";

async function getPrices() {
  const { data: prices, error } = await getServiceSupabase()
    .from("prices")
    .select("*")
    //select only the mileage rates
    .lt("id", 7);
    console.log(prices, "prices", error, "error");

  const stdDayRate = prices?.flat().find((p) => p.key === "standardDay")?.value;
  const stdNightRate = prices
    ?.flat()
    .find((p) => p.key === "standardNight")?.value;
  const pcDayRate = prices?.flat().find((p) => p.key === "pcDay")?.value;
  const pcNightRate = prices?.flat().find((p) => p.key === "pcNight")?.value;
  const mbDayRate = prices?.flat().find((p) => p.key === "mpvDay")?.value;
  const mbNightRate = prices?.flat().find((p) => p.key === "mpvNight")?.value;

  if (
    !stdDayRate ||
    !stdNightRate ||
    !pcDayRate ||
    !pcNightRate ||
    !mbDayRate ||
    !mbNightRate
  ) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not calculate price",
    });
  }
  return {
    stdDayRate,
    stdNightRate,
    pcDayRate,
    pcNightRate,
    mbDayRate,
    mbNightRate,
  };
}



export function calculate(
  distance: string,
  service: string,
  date: string,
  time: string,
  prices: {
    stdDayRate: number;
    stdNightRate: number;
    pcDayRate: number;
    pcNightRate: number;
    mbDayRate: number;
    mbNightRate: number;
  },
  returnDistance?: string,
  returnService?: string,
  returnDate?: string,
  returnTime?: string,
) {
  const { stdDayRate, stdNightRate, pcDayRate, pcNightRate, mbDayRate, mbNightRate } = prices;

  const serviceFee = 0;
  let rate = 0;
  let returnRate = 0;
  let price = 0;
  let returnPrice = 0;


  let coefficient = 1.2;

  if (parseFloat(distance) > 10 && parseFloat(distance) < 15) {
    coefficient = 1.12;
  } else if (parseFloat(distance) > 15 && parseFloat(distance) < 20) {
    coefficient = 1.1;
  } else if (parseFloat(distance) > 20 && parseFloat(distance) < 25) {
    coefficient = 0.98;
  } else if (parseFloat(distance) > 25 && parseFloat(distance) < 30) {
    coefficient = 0.92;
  } else if (parseFloat(distance) > 30 && parseFloat(distance) < 50) {
    coefficient = 0.8;
  } else if (parseFloat(distance) > 50 && parseFloat(distance) < 75) {
    coefficient = 0.78;
  } else if (parseFloat(distance) > 75 && parseFloat(distance) < 90) {
    coefficient = 0.77;
  } else if (parseFloat(distance) > 90 && parseFloat(distance) < 100) {
    coefficient = 0.74;
  }

  const timeOfDay = dayjs(`${date} ${time}`).hour();
  const returnTimeOfDay = dayjs(`${returnDate} ${returnTime}`).hour();

  if (service === "Standard") {
    if (timeOfDay >= 6 && timeOfDay < 23) {
      rate = stdDayRate * coefficient;
    } else {
      rate = stdNightRate * coefficient;
    }
  } else if (service === "PC") {
    if (timeOfDay >= 6 && timeOfDay < 23) {
      rate = pcDayRate * coefficient;
    } else {
      rate = pcNightRate * coefficient;
    }
  } else if (service === "MPV") {
    if (timeOfDay >= 6 && timeOfDay < 23) {
      rate = mbDayRate * coefficient;
    } else {
      rate = mbNightRate * coefficient;
    }
  } else {
    throw new TRPCError({
      message: "Invalid service type",
      code: "BAD_REQUEST",
    });
  }
  if (returnService) {
    if (returnService === "Standard") {
      if (returnTimeOfDay >= 6 && returnTimeOfDay < 23) {
        returnRate = stdDayRate;
      } else {
        returnRate = stdNightRate;
      }
    } else if (returnService === "PC") {
      if (returnTimeOfDay >= 6 && returnTimeOfDay < 23) {
        returnRate = pcDayRate;
      } else {
        returnRate = pcNightRate;
      }
    } else if (returnService === "MPV") {
      if (returnTimeOfDay >= 6 && returnTimeOfDay < 23) {
        returnRate = mbDayRate;
      } else {
        returnRate = mbNightRate;
      }
    }
  }

  price = parseFloat(distance) * rate + serviceFee;
  if (returnDistance) {
    returnPrice = parseFloat(returnDistance) * returnRate + serviceFee;
  } else {
    returnPrice = 0;
  }
  const total = price + (returnPrice ?? 0);
  console.log(
    "coefficient: ",
    coefficient,
    "rate: ",
    rate,
    returnRate,
    service,
    returnService,
    "total: ",
    total
  );
  return {total, coefficient, rate};
}
async function fixed() {
  const { data: prices } = await getServiceSupabase()
    .from("prices")
    .select("*")
    .gt("id", 6);

  if (!prices) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "There was an error fetching prices",
    });
  }

  return prices;
}

export const calculatePrice = createRouter()
  .query("fixed", {
    async resolve() {
      return (await fixed()) as inferAsyncReturnType<typeof fixed>;
    },
  })
  .query("get", {
    input: z.object({
      distance: z.string(),
      service: z.string(),
      date: z.string(),
      time: z.string(),
      return_distance: z.string().optional(),
      return_service: z.string().optional(),
      return_date: z.string().optional(),
      return_time: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      logRequest(ctx.req, input);
      const {
        distance,
        service,
        date,
        time,
        return_distance,
        return_service,
        return_date,
        return_time,
      } = input;
      const price = await getPrices().then(prices => calculate(
        distance,
        service,
        date,
        time,
        prices,
        return_distance,
        return_service,
        return_date,
        return_time
      ));
      return { price: price.total };
    },
  });
