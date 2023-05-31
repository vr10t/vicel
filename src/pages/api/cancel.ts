/* eslint-disable consistent-return */
import { NextApiRequest, NextApiResponse } from "next";
import initStripe, { Stripe } from "stripe";
import { buffer } from "micro";
import Cors from "micro-cors";
import sgMail from "@sendgrid/mail";
import Mergent from "mergent";
import { getServiceSupabase } from "../../utils/supabaseClient";
import { logApiRequest } from "../../utils/helpers";
import { env } from "../../server/env.mjs";

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});
export const config = { api: { bodyParser: false } };
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // eslint-disable-next-line new-cap
  const stripe = new initStripe(env.STRIPE_SECRET_KEY, {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: "2022-11-15",
  });
  const signature: any = req.headers["stripe-signature"];
  const signingSecret = env.STRIPE_REFUND_SIGNING_SECRET;
  const reqBuffer = await buffer(req);
  const supabase = getServiceSupabase();
  let event;
  // return res.status(200).send({reqBuffer});
  try {
    event = stripe.webhooks.constructEvent(reqBuffer, signature, signingSecret);
  } catch (error: any) {
    res.status(400).json(`Webhook error: ${error}`);
  }
  if (event?.type !== "charge.refunded") {
    return res.status(400).json(`Webhook error: ${event?.type} not handled`);
  }

  const chargeObj = event?.data.object as Stripe.Charge | undefined;
  if (!chargeObj) {
    return res.status(400).json(`Webhook error: ${event?.type} not handled`);
  }
  const charge = await stripe.charges.retrieve(chargeObj?.id, {
    expand: ["refunds"],
  });
  const bookingId = charge?.refunds?.data[0]?.metadata?.bookingId;
  const customerEmail = charge?.refunds?.data[0]?.metadata?.email;
  const reason = charge?.refunds?.data[0]?.metadata?.reason;
  const name = charge?.refunds?.data[0]?.metadata?.name;
  const task_id = charge?.refunds?.data[0]?.metadata?.task_id;

  logApiRequest(req, {
    bookingId,
    customerEmail,
    reason,
    name,
    task_id,
  });

  sgMail.setApiKey(env.SENDGRID_API_KEY);
  const mergent = new Mergent(env.MERGENT_API_KEY);

  const msg = {
    to: customerEmail,
    from: "bookings@vicel.co.uk",
    bcc: env.BCC_EMAIL,
    subject: "Your Booking Has Been Cancelled",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
        }
        .content {
            margin: 20px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Your Booking Has Been Cancelled</h1>
    </div>
    <div class="content">
        <p>Dear ${name ?? "valued customer"},</p>
    <p>We regret to inform you that ${
      reason ||
      "due to unforeseen circumstances, your recent booking with us has been cancelled."
    } We understand that this may cause inconvenience and we sincerely apologize for this.</p>

    <p>Please rest assured that a full refund has been issued to the original payment method.</p>

    <p>We would be more than happy to assist you in rebooking your reservation at a later date, or with any other accommodations you may need. Our customer service team is always here to help you.</p>

    <p>If you have any questions or concerns, please feel free to contact us at <a href="tel:+44 1442 250 000">+44 1442 250 000</a>  or <a href="mailto:contact@vicel.co.uk">contact@vicel.co.uk</a>.</p>

    <p>Again, we sincerely apologize for any inconvenience this may cause and we appreciate your understanding.</p>

    <p>Best regards,</p>
    <p>Vicel</p>
</div>
<div class="footer">
    <p>Thank you for choosing our services. We hope to serve you again in the future.</p>
</div>
</body>
</html> 
            
`,
  };
  try {
    console.log("Sending email");
    sgMail
      .send(
        [
          msg,
          {
            to: env.FW_EMAIL,
            from: "bookings@vicel.co.uk",
            subject: `Booking cancelled for ${customerEmail}`,
            html: `Booking successfully cancelled for ${customerEmail}. Reason: ${reason}`,
          },
        ],
        true
      )
      .then(async () => {
        console.log("Email sent, updating booking status");
        await supabase
          .from("bookings")
          .update({ status: "Cancelled" })
          .eq("id", bookingId);
      })
      .then(async () => {
        console.log("Booking status updated, deleting task");
        if (!task_id) {
            console.log("No task id found, fetching from db");
          const booking = await supabase
            .from("bookings")
            .select("*")
            .eq("id", bookingId);
          if (booking.data) await mergent.tasks.delete(booking.data[0].task_id);
          console.log("Task deleted");
          res.status(200).send("OK");
        } else {
            console.log("Task id found, deleting");
          await mergent.tasks.delete(task_id);
          console.log("Task deleted");
            res.status(200).send("OK");
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(503).send(JSON.stringify(err));
      });
  } catch (err: any) {
    return res.status(503).send(JSON.stringify(err));
  }
};

export default cors(handler as any);
