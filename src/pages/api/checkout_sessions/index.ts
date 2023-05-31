import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import UAParser from "ua-parser-js";
import { CURRENCY } from "../../../../config/index";
import { env } from "../../../server/env.mjs";
import { logRequest } from "../../../utils/helpers";
import { formatAmountForStripe } from "../../../utils/stripe-helpers";
import { getServiceSupabase } from "../../../utils/supabaseClient";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: "2022-11-15",
});
const supabase = getServiceSupabase();

//eslint-disable-next-line consistent-return
async function handler(req: NextApiRequest, res: NextApiResponse) {
  logRequest(req);
  if (req.method === "POST") {
    // TODO: use amount from db
    // get total from supabase using bookingId
    const {
      address,
      bookingId,
      email,
      name,
      subtotal,
      grand,
      amount,
      location,
      destination,
      return_location,
      return_destination,
      dateTime,
      returnDateTime,
      secret,
      coupon,
    } = req.body;

    if (
      !bookingId ||
      !email ||
      !name ||
      !subtotal ||
      !grand ||
      !location ||
      !destination ||
      !dateTime ||
      !secret
    ) {
      console.log("missing data");
      console.log(req.body);
      return res
        .status(400)
        .json({ statusCode: 400, message: "Missing parameters" });
    }
    // const { data: booking, error } = await supabase
    //   .from('bookings')
    //   .select('*')
    //   .eq('id', bookingId);
    // if (error) {
    //   return res.status(500).send(error.message);
    // }
    // if(!booking) {
    //  return res.status(404).send('Booking not found');
    // }

    try {
      // Create Checkout Sessions from body params.
      const params: Stripe.Checkout.SessionCreateParams = {
        submit_type: "book",
        payment_method_types: ["card"],

        line_items: [
          {
            price_data: {
              currency: CURRENCY,
              product_data: { name: `Booking for ${address}` },
              unit_amount: formatAmountForStripe(amount, CURRENCY),
            },
            quantity: 1,
          },
          //Airport Parking Fee
          {
            price_data: {
              currency: CURRENCY,
              product_data: { name: `Airport Parking Fee` },
              unit_amount: formatAmountForStripe(5, CURRENCY),
            },
            quantity: 1,
          },
        ],
        discounts: coupon
          ? [
              {
                coupon,
              },
            ]
          : undefined,
        mode: "payment",
        success_url: `${req.headers.origin}/booking-confirmation/{CHECKOUT_SESSION_ID}?qsid=${secret}`,
        cancel_url: `${req.headers.origin}/booking`,
        metadata: {
          bookingId,
          email,
          name,
          subtotal,
          grand,
          location,
          destination,
          dateTime,
          ...(return_location &&
            return_destination && {
              return_location,
              return_destination,
              returnDateTime,
            }),

          bookingLink: `${req.headers.origin}/b/${bookingId}?sid=${secret}`,
        },
      };
      console.log("params", params);

      const checkoutSession: Stripe.Checkout.Session =
        await stripe.checkout.sessions.create(params);
      const sessionId = checkoutSession.id;
      console.log("checkout session created", checkoutSession);

      res.status(200).json({ statusCode: 200, checkoutSession });
    } catch (err: any) {
      console.log("checkout session error", err);
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    // res.setHeader("Allow", "POST");
    // res.status(405).end("Method Not Allowed");
    console.log("method not allowed", req.method);
    res.status(405).json({ statusCode: 405, message: "Method Not Allowed" });
  }
  // return res.status(500).send("Something went wrong");
}
export default handler;
