/* eslint-disable object-shorthand */
import { z } from "zod";
import UAParser from "ua-parser-js";
import { createRouter } from "./context";
import { getServiceSupabase } from "../../utils/supabaseClient";
import { env } from "../env.mjs";

export const getUser = createRouter()
  .mutation("update", {
    input: z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      phone: z.string(),
    }),
    async resolve({ input, ctx }) {
      const userAgent = new UAParser(ctx.req.headers["user-agent"]);
      const browser = userAgent.getBrowser();
      const os = userAgent.getOS();
      const device = userAgent.getDevice();

      const ip =
        ctx.req.headers["x-forwarded-for"] || ctx.req.connection.remoteAddress;

      console.log(
        `User Agent: ${browser.name} ${browser.version}, OS ${os.name} ${
          os.version
        }, device model ${device.model} with IP ${ip} requested function ${
          ctx.req.url
        } 
      at ${new Date().toLocaleString()} from page ${
          ctx.req.headers.referer
        } with input ${JSON.stringify(input)}`
      );
      const supabase = getServiceSupabase();
      const { id } = input;
      const res = await supabase
        .from("profiles")
        .update({
          first_name: input.firstName,
          last_name: input.lastName,
          phone: input.phone,
        })
        .eq("id", id);
      return res;
    },
  })
  .query("get", {
    input: z.object({
      email: z.string(),
    }),
    async resolve({ input, ctx }) {
      const supabase = getServiceSupabase();
      const res = await supabase
        .from("profiles")
        .select("*")
        .eq("email", input.email);
      return res;
    },
  })
  .mutation("confirm", {
    input: z.object({
      bookingId: z.string(),
    }),
    async resolve({ input, ctx }) {
      const supabase = getServiceSupabase();
      const { data, error } = await supabase
        .from("bookings")
        .select("user_id")
        .eq("id", input.bookingId);
      if (error) {
        return error;
      }
      const { user_id } = data[0];
      const res = await supabase.auth.admin.updateUserById(user_id!, {
        email_confirm: true,
      });
      return res;
    },
  })
  .mutation("resetPassword", {
    input: z.object({
      user_id: z.string(),
      password: z.string(),
    }),
    async resolve({ input, ctx }) {
      const userAgent = new UAParser(ctx.req.headers["user-agent"]);
      const browser = userAgent.getBrowser();
      const os = userAgent.getOS();
      const device = userAgent.getDevice();

      const ip =
        ctx.req.headers["x-forwarded-for"] || ctx.req.connection.remoteAddress;

      console.log(
        `User Agent: ${browser.name} ${browser.version}, OS ${os.name} ${
          os.version
        }, device model ${device.model} with IP ${ip} requested function ${
          ctx.req.url
        } 
      at ${new Date().toLocaleString()} from page ${
          ctx.req.headers.referer
        } with input ${JSON.stringify(input)}`
      );
      const supabase = getServiceSupabase();
      const { data, error } = await supabase.auth.admin.updateUserById(
        input.user_id,
        { password: input.password }
      );
      return { data, error };
    },
  }).query("isAdmin", {
    input: z.object({
      id: z.string(),
      }),
    async resolve({ input, ctx }) {
      return input.id === env.ADMIN_ID;
    },
  });
