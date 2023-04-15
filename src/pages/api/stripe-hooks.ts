/* eslint-disable no-use-before-define */
/* eslint-disable consistent-return */
import { StripeError } from "@stripe/stripe-js";
import { NextApiRequest, NextApiResponse } from "next";
import initStripe, { Stripe } from "stripe";
import { buffer } from "micro";
import Cors from "micro-cors";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import sgMail from "@sendgrid/mail";
import Mergent from "mergent";
import dayjs from "dayjs";
import { getServiceSupabase } from "../../utils/supabaseClient";
import { logApiRequest } from "../../utils/helpers";

export interface Event {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: Data;
  livemode: boolean;
  pending_webhooks: number;
  request: Request;
  type: string;
}

export interface Data {
  object: Obj;
}

export interface Obj {
  id: string;
  object: string;
  after_expiration: any;
  allow_promotion_codes: any;
  amount_subtotal: number;
  amount_total: number;
  automatic_tax: AutomaticTax;
  billing_address_collection: any;
  cancel_url: string;
  client_reference_id: any;
  consent: any;
  consent_collection: any;
  created: number;
  currency: string;
  customer: string;
  customer_creation: string;
  customer_details: CustomerDetails;
  customer_email: any;
  expires_at: number;
  livemode: boolean;
  locale: any;
  metadata: Metadata;
  mode: string;
  payment_intent: string;
  payment_link: any;
  payment_method_collection: string;
  payment_method_types: string[];
  payment_status: string;
  phone_number_collection: PhoneNumberCollection;
  recovered_from: any;
  setup_intent: any;
  shipping: any;
  shipping_address_collection: any;
  shipping_options: any[];
  shipping_rate: any;
  status: string;
  submit_type: string;
  subscription: any;
  success_url: string;
  total_details: TotalDetails;
  url: any;
}

export interface AutomaticTax {
  enabled: boolean;
  status: any;
}

export interface CustomerDetails {
  address: Address;
  email: string;
  name: string;
  phone: any;
  tax_exempt: string;
  tax_ids: any[];
}

export interface Address {
  city: any;
  country: string;
  line1: any;
  line2: any;
  postal_code: string;
  state: any;
}

export interface Metadata {
  bookingId: string;
  bookingLink: string;
  return_destination: string;
  vat: string;
  subtotal: string;
  destination: string;
  returnDateTime: string;
  grand: string;
  email: string;
  dateTime: string;
  return_location: string;
  location: string;
  name: string;
}

export interface PhoneNumberCollection {
  enabled: boolean;
}

export interface TotalDetails {
  amount_discount: number;
  amount_shipping: number;
  amount_tax: number;
}

export interface Request {
  id: any;
  idempotency_key: any;
}

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});
export const config = {
  api: { bodyParser: false },
};
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.time();
  const supabase = getServiceSupabase();
  // eslint-disable-next-line new-cap
  const stripe = new initStripe(process.env.STRIPE_SECRET_KEY!, {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: "2022-11-15",
  });

  const signature: any = req.headers["stripe-signature"];
  const signingSecret = process.env.STRIPE_SIGNING_SECRET!;
  const reqBuffer = await buffer(req);
  let event;
  // set the Mergent API key
  const mergent = new Mergent(process.env.MERGENT_API_KEY!);

  // return res.status(200).json({reqBuffer});
  try {
    event = stripe.webhooks.constructEvent(
      reqBuffer,
      signature,
      signingSecret
    ) as Event;
  } catch (error: any) {
    res.status(400).json(`Webhook error: ${error}`);
  }
  switch (event?.type) {
    case "checkout.session.completed":
      // Handle the checkout.session.completed event
      console.log("Trying to confirm booking");

      logApiRequest(req, {
        event: event.type,
        data: event.data.object,
      });

      try {
        const { bookingId } = event.data.object.metadata;
        supabase
          .from("bookings")
          .update({
            status: "Confirmed",
          })
          .eq("id", bookingId)
          .then((resp: PostgrestResponse<any>) => console.log(resp, "res"));
        console.log("Booking confirmed");
      } catch (error) {
        console.log(error);
        console.log("Booking not confirmed");
        res.status(500).json("Error confirming booking");
      }

      // create a Task
      console.log("Trying to create mergent task");
      mergent.tasks
        .create({
          request: {
            url: "https://www.vicel.co.uk/api/mergent",
            body: JSON.stringify({
              to: event.data.object.metadata.email,
              date: event.data.object.metadata.dateTime,
              returnDate: event.data.object.metadata.returnDateTime,
              location: event.data.object.metadata.location,
              returnLocation: event.data.object.metadata.return_location,
              name: event.data.object.metadata.name,
              bookingId: event.data.object.metadata.bookingId,
              bookingLink: event.data.object.metadata.bookingLink,
              destination: event.data.object.metadata.destination,
              returnDestination: event.data.object.metadata.return_destination,

              secret: process.env.API_ROUTE_SECRET,
            }),
          },
          scheduled_for: dayjs(event.data.object.metadata.dateTime)
            .subtract(1, "day")
            .toISOString(),
        })
        .then((task) => {
          console.log("Mergent task created");
          res.status(200).json("Mergent task created");
        })
        .catch((error) => console.error(error));
      break;
    case "checkout.session.expired":
      try {
        const { bookingId } = event.data.object.metadata;

        const booking = await supabase
          .from("bookings")
          .select("*")
          .eq("id", bookingId);
        if ((booking as unknown as string[]).length === 0) {
          res.status(404).json("Booking not found");
        } else {
          await supabase.from("bookings").delete().eq("id", bookingId);
          res.status(200).json("Booking cancelled");
        }
      } catch (error) {
        res.status(500).json("error cancelling booking");
      }
      break;
    default:
      // Unexpected event type
      res.status(400).end();

      break;
  }
  // console.log({ event });
  // res.status(200).end('Received event');
};
export default cors(handler as any);
