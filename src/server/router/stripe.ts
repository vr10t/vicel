/* eslint-disable consistent-return */
import initStripe from "stripe";
import z from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter } from "./context";
import { getServiceSupabase } from "../../utils/supabaseClient";
import { logRequest } from "../../utils/helpers";
import { env } from "../env.mjs";

export const stripe = createRouter()
  .mutation("processRefund", {
    input: z.object({
      chargeId: z.string().min(1),
      secret: z.string(),
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

      // eslint-disable-next-line new-cap
      const { chargeId } = input;

      // eslint-disable-next-line new-cap
      const stripeClient = new initStripe(env.STRIPE_SECRET_KEY, {
        // https://github.com/stripe/stripe-node#configuration
        apiVersion: "2022-11-15",
      });

      try {
        const refund = await stripeClient.refunds.create({
          charge: chargeId,
        });

        return { data: refund, error: null };
      } catch (err: any) {
        throw new TRPCError({
          message: err.message,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  })
  .mutation("getCheckoutSession", {
    input: z.object({
      checkout_session_id: z.string(),
      secret: z.string(),
    }),
    async resolve({ input, ctx }) {
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
      // eslint-disable-next-line new-cap
      const stripeClient = new initStripe(env.STRIPE_SECRET_KEY, {
        apiVersion: "2022-11-15",
      });
      const session = await stripeClient.checkout.sessions.retrieve(
        input.checkout_session_id
      );

      if (session) {
        return session;
      }
      throw new TRPCError({
        message: "No session found",
        code: "NOT_FOUND",
      });
    },
  })
  .mutation("refundPaymentIntent", {
    input: z.object({
      paymentIntentId: z.string(),
      secret: z.string(),
    }),
    async resolve({ input, ctx }) {
      logRequest(ctx.req, input);
      const supabase = getServiceSupabase();
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("secret", input.secret);
      console.log(data, error);
      if (error || data.length === 0) {
        throw new TRPCError({
          message: "You are not authorized to call this API",
          code: "UNAUTHORIZED",
        });
      }
      // eslint-disable-next-line new-cap
      const stripeClient = new initStripe(env.STRIPE_SECRET_KEY, {
        apiVersion: "2022-11-15",
      });
      const refund = await stripeClient.refunds.create({
        payment_intent: input.paymentIntentId,
      });
      return { data: refund, error: null };
    },
  });
