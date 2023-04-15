/* eslint-disable consistent-return */
import { NextApiRequest, NextApiResponse } from "next";
import initStripe, { Stripe } from "stripe";
import { buffer } from "micro";
import Cors from "micro-cors";
import sgMail from "@sendgrid/mail";
import { getServiceSupabase } from "../../utils/supabaseClient";
import { logApiRequest } from "../../utils/helpers";

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});
export const config = { api: { bodyParser: false } };
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // eslint-disable-next-line new-cap
  const stripe = new initStripe(process.env.STRIPE_SECRET_KEY!, {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: "2022-11-15",
  });
  const signature: any = req.headers["stripe-signature"];
  const signingSecret = process.env.STRIPE_FW_SIGNING_SECRET!;
  const reqBuffer = await buffer(req);
  const supabase = getServiceSupabase();
  let event;
  // return res.status(200).send({reqBuffer});
  try {
    event = stripe.webhooks.constructEvent(reqBuffer, signature, signingSecret);
  } catch (error: any) {
    res.status(400).json(`Webhook error: ${error}`);
  }

  const session = event?.data.object as Stripe.Checkout.Session;
  const bookingId = session.metadata?.bookingId;
  const name = session.metadata?.name;
  const subtotal = session.metadata?.subtotal;
  const grand = session.metadata?.grand;
  const location = session.metadata?.location;
  const destination = session.metadata?.destination;
  const dateTime = session.metadata?.dateTime;
  const return_location = session.metadata?.return_location;
  const return_destination = session.metadata?.return_destination;
  const returnDateTime = session.metadata?.returnDateTime;
  const bookingLink = session.metadata?.bookingLink;

  logApiRequest(req, {
    bookingId,
    name,
    subtotal,
    grand,
    location,
    destination,
    dateTime,
    return_location,
    return_destination,
    returnDateTime,
    bookingLink,
  });

  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId);
  if (!data) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    const response = await sgMail.send({
      to: "contact@vicel.co.uk",
      bcc: process.env.BCC_EMAIL,
      from: "bookings@vicel.co.uk",
      subject: "New booking",
      text: "You have a new booking. Please check your dashboard",
    });
    return res.status(200).send(JSON.stringify({ received: true }));
  }
  const booking = data[0];
  const {
    distance,
    service,
    flight_number,
    first_name,
    last_name,
    email,
    phone,
    passengers,
    plane_arriving_from,
    airline_name,
    return_first_name,
    return_last_name,
    return_email,
    return_phone,
    return_service,
    return_passengers,
    instructions,
    total,
  } = booking;
  const locationLink = `https://www.google.com/maps/place/${location}`;
  const destinationLink = `https://www.google.com/maps/place/${destination}`;
  const returnLocationLink = `https://www.google.com/maps/place/${return_location}`;
  const returnDestinationLink = `https://www.google.com/maps/place/${return_destination}`;
  const stripeLink = `https://dashboard.stripe.com/payments/${session.payment_intent}`;
  const cancelLink = `https://www.vicel.co.uk/admin/cancel/${bookingId}?secret=${booking.secret}&admin_secret=${process.env.ADMIN_SECRET}`;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const msg = {
    to: "contact@vicel.co.uk",
    from: "bookings@vicel.co.uk",
    bcc: process.env.BCC_EMAIL,
    subject: "New Booking",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
        />
      </head>
      <body
        style="
          background-color: #f3f4f6;
          color: #111827;
          width: 100%;
          margin: 0 1rem 0 2rem;
          max-width: max-content;
        "
      >
        <h1 style="">You have a new booking!</h1>
        <hr />
        <div>
          <div>
            <p style="font-size: 1.1rem; font-weight: 700">
              Name:
              <span style="font-size: medium; font-weight: 400"
                >${first_name} ${last_name}
              </span>
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Email:
              <span style="font-size: medium; font-weight: 400">${email}</span>
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Phone:
              <span style="font-size: medium; font-weight: 400">${phone}</span>
            </p>
    
            <p style="font-size: 1.1rem; font-weight: 700">
              Pickup Date:
              <span style="font-size: medium; font-weight: 400">${dateTime}</span>
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Pickup Address:
              <span style="font-size: medium; font-weight: 400"
                ><a href="${locationLink}">${location}</a></span
              >
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Dropoff Address:
              <span style="font-size: medium; font-weight: 400"
                ><a href="${destinationLink}">${destination}</a></span
              >
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Number of Passengers:
              <span style="font-size: medium; font-weight: 400">${passengers}</span>
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Car:
              <span style="font-size: medium; font-weight: 400">${service}</span>
            </p>
            ${
              !!flight_number &&
              `
            <p style="font-size: 1.1rem; font-weight: 700">
              Flight Number:
              <span style="font-size: medium; font-weight: 400"
                >${flight_number}</span
              >
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Plane Arriving From:
              <span style="font-size: medium; font-weight: 400"
                >${plane_arriving_from}</span
              >
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Airline Name:
              <span style="font-size: medium; font-weight: 400"
                >${airline_name}</span
              >
            </p>
            `
            } ${
      !!returnDateTime &&
      `
            <h2>Return</h2>
            <hr />
            <p style="font-size: 1.1rem; font-weight: 700">
              Pickup Date:
              <span style="font-size: medium; font-weight: 400"
                >${returnDateTime}</span
              >
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Pickup Address:
              <span style="font-size: medium; font-weight: 400"
                ><a href="${returnLocationLink}">${return_location}</a></span
              >
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Dropoff Address:
              <span style="font-size: medium; font-weight: 400"
                ><a href="${returnDestinationLink}">${return_destination}</a></span
              >
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Number of Passengers:
              <span style="font-size: medium; font-weight: 400"
                >${return_passengers ?? passengers}</span
              >
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Car:
              <span style="font-size: medium; font-weight: 400"
                >${return_service ?? service}</span
              >
            </p>
            `
    } ${
      return_first_name &&
      `
            <p style="font-size: 1.1rem; font-weight: 700">
              First Name:
              <span style="font-size: medium; font-weight: 400"
                >${return_first_name}</span
              >
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Last Name:
              <span style="font-size: medium; font-weight: 400"
                >${return_last_name}</span
              >
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Email:
              <span style="font-size: medium; font-weight: 400"
                >${return_email}</span
              >
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Phone:
              <span style="font-size: medium; font-weight: 400"
                >${return_phone}</span
              >
            </p>
            `
    }
           
          </div>
          <div>
            <hr />
            <p style="font-size: 1.1rem; font-weight: 700">
            Special Instructions:
            <span style="font-size: medium; font-weight: 400"
              >${instructions}</span
            >
          </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Total:
              <span style="font-size: medium; font-weight: 400">${total}</span>
            </p>
            <hr />
            <a href="${stripeLink}" style="text-decoration: none">
              Stripe Transaction Link
            </a>
            |
            <a href="mailto:${email}" style="text-decoration: none">
              Email Customer
            </a>
            |
            <a href="tel:${phone}" style="text-decoration: none"> Call Customer </a>
          </div>
          <div
            style="
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 1rem;
              margin: 4rem 0 10rem;
            "
          >
            <a
              href="${bookingLink}"
              style="
                background-color: #111827;
                color: #f3f4f6;
                padding: 0.5rem, 0.5rem, 0.5rem, 0.5rem;
                text-decoration: none;
                font-size: 1.1rem;
                font-weight: 700;
                padding: 0.5rem 1rem;
                border-radius: 0.25rem;
              "
              >View Booking</a
            >
            <a
              href="${cancelLink}"
              style="
                background-color: #e02424;
                color: #f3f4f6;
                padding: 0.5rem, 0.5rem, 0.5rem, 0.5rem;
                text-decoration: none;
                font-size: 1.1rem;
                font-weight: 700;
                padding: 0.5rem 1rem;
                border-radius: 0.25rem;
              "
              >Cancel Booking</a
            >
          </div>
        </div>
      </body>
    </html>
    
            
`,
  };
  try {
    console.log("Sending email");
    await sgMail.send(msg);
    res.status(200).json("Email sent");
  } catch (err: any) {
    res.status(400).end("Error confirming booking");
  }
};

export default cors(handler as any);
