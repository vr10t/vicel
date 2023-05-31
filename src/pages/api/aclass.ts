import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import sgMail from "@sendgrid/mail";
import { env } from "../../server/env.mjs";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name, email, phone } = req.body;
  let { company, passengers, date, time, pickup, dropoff, message } = req.body;
  if (!company) company = "N/A";
  if (!passengers) passengers = "N/A";
  if (!date) date = "N/A";
  if (!time) time = "N/A";
  if (!pickup) pickup = "N/A";
  if (!dropoff) dropoff = "N/A";
  if (!message) message = "N/A";
  const dateTime =
    !date || !time
      ? "N/A"
      : dayjs(`${date} ${time}`).format("MMMM D, YYYY h:mm A");
  const msg = {
    to: env.ACLASS_EMAIL,
    from: "aclass@vicel.co.uk",
    bcc: env.BCC_EMAIL,
    subject: "New Message from A-Class Taxis Website",
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
        <div>
          <div>
            <p style="font-size: 1.1rem; font-weight: 700">
              Name:
              <span style="font-size: medium; font-weight: 400"
                >${name}
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
              Company:
              <span style="font-size: medium; font-weight: 400">${company}</span>
            </p>
    
            <p style="font-size: 1.1rem; font-weight: 700">
              Pickup Date:
              <span style="font-size: medium; font-weight: 400">${dateTime}</span>
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Pickup Address:
              <span style="font-size: medium; font-weight: 400"
                >${pickup}</span
              >
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Dropoff Address:
              <span style="font-size: medium; font-weight: 400"
                >${dropoff}</span
              >
            </p>
            <p style="font-size: 1.1rem; font-weight: 700">
              Number of Passengers:
              <span style="font-size: medium; font-weight: 400">${passengers}</span>
            </p>
          </div>
          <div>
            <hr />
            <p style="font-size: 1.1rem; font-weight: 700">
            Message:
            <span style="font-size: medium; font-weight: 400"
              >${message}</span
            >
          </p>
          </div>
        </div>
      </body>
    </html>
            
`,
  };
  sgMail.setApiKey(env.SENDGRID_API_KEY);
  sgMail
    .send(msg)
    .then(() => {
      res.status(200).send("Success");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error");
    });
}
