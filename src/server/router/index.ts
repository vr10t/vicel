// src/server/router/index.ts
import superjson from "superjson";
import { createRouter } from "./context";
import { getUser } from "./getUser";
import { getBookings } from "./getBookings";
import { calculatePrice } from "./price";
import { distance } from "./distance";
import { stripe } from "./stripe";
import { sendgrid } from "./sendgrid";
import { promo } from "./promo";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("user.", getUser)
  .merge("bookings.", getBookings)
  .merge("price.", calculatePrice)
  .merge("distance.", distance)
  .merge("stripe.", stripe)
  .merge("sendgrid.", sendgrid)
  .merge("promo.", promo);

// export type definition of API
export type AppRouter = typeof appRouter;
