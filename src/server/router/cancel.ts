/* eslint-disable consistent-return */
import initStripe from "stripe";
import z from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter } from "./context";
import { getServiceSupabase } from "../../utils/supabaseClient";
import { logRequest } from "../../utils/helpers";

export const cancel = createRouter().mutation("withPaymentIntent", {
  input: z.object({
    paymentIntent: z.string(),
    secret: z.string(),
    reason: z.string(),
    name: z.string(),
    task_id: z.string(),
  }),
  async resolve({ input, ctx }) {
    logRequest(ctx.req, input);
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("secret", input.secret);
    if (error || data.length === 0) {
      throw new TRPCError({
        message: "You are not authorized to call this API",
        code: "UNAUTHORIZED",
      });
    }

    const { paymentIntent, reason, name, task_id } = input;
    const { email, id } = data[0];
    if (!email || !id) {
        throw new TRPCError({
            message: "Booking not found",
            code: "INTERNAL_SERVER_ERROR",
        });
    }

    // eslint-disable-next-line new-cap
    const stripeClient = new initStripe(process.env.STRIPE_SECRET_KEY!, {
      // https://github.com/stripe/stripe-node#configuration
      apiVersion: "2022-11-15",
    });

    try {
      const refund = await stripeClient.refunds.create({
        payment_intent: paymentIntent,
        metadata: {
            bookingId: id,
          reason,
          email,
          name,
          task_id,
        },
      });

      return { data: refund, error: null };
    } catch (err: any) {
      throw new TRPCError({
        message: err.message,
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  },
});
