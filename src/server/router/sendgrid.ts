import z from "zod";
import { TRPCError } from "@trpc/server";
import sgMail from "@sendgrid/mail";
import { createRouter } from "./context";
import { env } from "../env.mjs";

export const sendgrid = createRouter()
  .mutation("sendEmail", {
    input: z.object({
      subject: z.string().min(1),
      to: z.string().min(1),
      text: z.string().min(1),
      html: z.string().min(1),
    }),
    async resolve({ input, ctx }) {
      sgMail.setApiKey(env.SENDGRID_API_KEY);
      const msg = {
        to: input.to, // Change to your recipient
        from: "bookings@vicel.co.uk", // Change to your verified sender
        subject: input.subject,
        text: input.text,
        html: input.html,
      };
      try {
        await sgMail.send(msg);
        return { data: "success", error: null };
      } catch (err: any) {
        console.log(err.body);
        throw new TRPCError({
          message: err.message,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  })
  .mutation("contact", {
    input: z.object({
      name: z.string().min(1),
      email: z.string().min(1),
      message: z.string().min(1),
      phone: z.string().min(1),
      captcha: z.string({'required_error': 'Captcha is required'}).min(1,{message: 'Captcha is required'}),
    }),
    async resolve({ input, ctx }) {
      const { name, email, message, captcha,phone } = input;
      const response = await fetch(`https://hcaptcha.com/siteverify`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
        body: `response=${captcha}&secret=${env.HCAPTCHA_SECRET_KEY}`,
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        sgMail.setApiKey(env.SENDGRID_API_KEY);
        const msg = {
          to: "contact@vicel.co.uk",
          from: "forms@vicel.co.uk",
          subject: "Contact Form",
          html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p><p>Message: ${message}</p>`,
        };
        try {
          await sgMail.send(msg);
          return { data: "success", error: null };
        } catch (err: any) {
          console.log(err.body);
          throw new TRPCError({
            message: err.message,
            code: "INTERNAL_SERVER_ERROR",
          });
        }
      } else {
        throw new TRPCError({
          message: "Invalid captcha",
          code: "BAD_REQUEST",
        });
      }
    },
  });
