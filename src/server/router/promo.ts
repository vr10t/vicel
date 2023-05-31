import { z } from "zod";
import sgMail from "@sendgrid/mail";
import initStripe from "stripe";
import { TRPCError } from "@trpc/server";
import { createRouter } from "./context";
import { logRequest } from "../../utils/helpers";
import { env } from "../env.mjs";

export const promo = createRouter()
  .mutation("create", {
    input: z.object({
      name: z.string().optional(),
    }),

    async resolve({ input, ctx }) {
      // eslint-disable-next-line new-cap
      const stripe = new initStripe(env.STRIPE_SECRET_KEY, {
        apiVersion: "2022-11-15",
      });
      const { name } = input;
      console.log("creting coupon");

      const coupon = await stripe.coupons.create({
        percent_off: 10,
        duration: "once",
        metadata: {
          name: name ?? "Anonymous",
        },
      });
      console.log("coupon created", coupon);
      return coupon;
    },
  })

  .mutation("redeem", {
    input: z.object({
      code: z.string(),
    }),
    async resolve({ input, ctx }) {
      logRequest(ctx.req, input);
      const { code } = input;
      // eslint-disable-next-line new-cap
      const stripe = new initStripe(env.STRIPE_SECRET_KEY, {
        apiVersion: "2022-11-15",
      });

      const coupon = await stripe.coupons.retrieve(code);

      if (coupon.valid) {
        console.log("coupon valid");
        return {
          valid: true,
          name: coupon.metadata?.name,
          message: "Coupon successfully applied",
        };
      }
      console.log("coupon invalid");
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Invalid coupon",
      });
    },
  })
  .mutation("sendEmail", {
    input: z.object({
      email: z.string(),
      code: z.string(),
    }),
    async resolve({ input, ctx }) {
      logRequest(ctx.req, input);

      const { email, code } = input;

      console.log("sending email", email, code);
      sgMail.setApiKey(env.SENDGRID_API_KEY);

      const msg = {
        from: "no-reply@vicel.co.uk",
        to: email,
        subject: `Promo Code`,
        html: `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html
  data-editor-version="2"
  class="sg-campaigns"
  xmlns="http://www.w3.org/1999/xhtml"
>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <!--<![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <style type="text/css">
        body {
          width: 600px;
          margin: 0 auto;
        }
        table {
          border-collapse: collapse;
        }
        table,
        td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }
      </style>
    <![endif]-->
    <style type="text/css">
      body,
      p,
      div {
        font-family: inherit;
        font-size: 14px;
      }
      body {
        color: #000000;
      }
      body a {
        color: #1188e6;
        text-decoration: none;
      }
      p {
        margin: 0;
        padding: 0;
      }
      table.wrapper {
        width: 100% !important;
        table-layout: fixed;
        -webkit-font-smoothing: antialiased;
        -webkit-text-size-adjust: 100%;
        -moz-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      img.max-width {
        max-width: 100% !important;
      }
      .column.of-2 {
        width: 50%;
      }
      .column.of-3 {
        width: 33.333%;
      }
      .column.of-4 {
        width: 25%;
      }
      ul ul ul ul {
        list-style-type: disc !important;
      }
      ol ol {
        list-style-type: lower-roman !important;
      }
      ol ol ol {
        list-style-type: lower-latin !important;
      }
      ol ol ol ol {
        list-style-type: decimal !important;
      }
      @media screen and (max-width: 480px) {
        .preheader .rightColumnContent,
        .footer .rightColumnContent {
          text-align: left !important;
        }
        .preheader .rightColumnContent div,
        .preheader .rightColumnContent span,
        .footer .rightColumnContent div,
        .footer .rightColumnContent span {
          text-align: left !important;
        }
        .preheader .rightColumnContent,
        .preheader .leftColumnContent {
          font-size: 80% !important;
          padding: 5px 0;
        }
        table.wrapper-mobile {
          width: 100% !important;
          table-layout: fixed;
        }
        img.max-width {
          height: auto !important;
          max-width: 100% !important;
        }
        a.bulletproof-button {
          display: block !important;
          width: auto !important;
          font-size: 80%;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        .columns {
          width: 100% !important;
        }
        .column {
          display: block !important;
          width: 100% !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        .social-icon-column {
          display: inline-block !important;
        }
      }
    </style>
    <!--user entered Head Start-->
    <link
      href="https://fonts.googleapis.com/css?family=Viga&display=swap"
      rel="stylesheet"
    />
    <style>
      body {
        font-family: "Viga", sans-serif;
      }
    </style>
    <!--End Head user entered-->
  </head>
  <body>
    <center
      class="wrapper"
      data-link-color="#1188E6"
      data-body-style="font-size:14px; font-family:inherit; color:#000000; background-color:#f0f0f0;"
    >
      <div class="webkit">
        <table
          cellpadding="0"
          cellspacing="0"
          border="0"
          width="100%"
          class="wrapper"
          bgcolor="#f0f0f0"
        >
          <tr>
            <td valign="top" bgcolor="#f0f0f0" width="100%">
              <table
                width="100%"
                role="content-container"
                class="outer"
                align="center"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td width="100%">
                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>
                        <td>
                          <!--[if mso]>
    <center>
    <table><tr><td width="600">
  <![endif]-->
                          <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="width: 100%; max-width: 600px"
                            align="center"
                          >
                            <tr>
                              <td
                                role="modules-container"
                                style="
                                  padding: 0px 0px 0px 0px;
                                  color: #000000;
                                  text-align: left;
                                "
                                bgcolor="#ffffff"
                                width="100%"
                                align="left"
                              >
                                <table
                                  class="module preheader preheader-hide"
                                  role="module"
                                  data-type="preheader"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  style="
                                    display: none !important;
                                    mso-hide: all;
                                    visibility: hidden;
                                    opacity: 0;
                                    color: transparent;
                                    height: 0;
                                    width: 0;
                                  "
                                >
                                  <tr>
                                    <td role="module-content">
                                      <p></p>
                                    </td>
                                  </tr>
                                </table>
                                <table
                                  class="module"
                                  role="module"
                                  data-type="text"
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  width="100%"
                                  style="table-layout: fixed"
                                  data-muid="4219b918-14f4-4496-a204-7ff11b69e260"
                                  data-mc-module-version="2019-10-22"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        style="
                                          padding: 0px 0px 0px 0px;
                                          line-height: 22px;
                                          text-align: inherit;
                                          background-color: #ffffff;
                                        "
                                        height="100%"
                                        valign="top"
                                        bgcolor="#FFFFFF"
                                        role="module-content"
                                      >
                                        <div>
                                          <div></div>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <table
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  align="center"
                                  width="100%"
                                  role="module"
                                  data-type="columns"
                                  style="padding: 30px 20px 40px 30px"
                                  bgcolor="#f3f3f3"
                                  data-distribution="1"
                                >
                                  <tbody>
                                    <tr role="module-content">
                                      <td height="100%" valign="top">
                                        <table
                                          width="550"
                                          style="
                                            width: 550px;
                                            border-spacing: 0;
                                            border-collapse: collapse;
                                            margin: 0px 0px 0px 0px;
                                            background-color: #f3f3f3;
                                          "
                                          cellpadding="0"
                                          cellspacing="0"
                                          align="left"
                                          border="0"
                                          bgcolor=""
                                          class="column column-0"
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style="
                                                  padding: 0px;
                                                  margin: 0px;
                                                  border-spacing: 0;
                                                "
                                              >
                                                <table
                                                  class="wrapper"
                                                  role="module"
                                                  data-type="image"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  width="100%"
                                                  style="table-layout: fixed"
                                                  data-muid="b422590c-5d79-4675-8370-a10c2c76af02"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        style="
                                                          font-size: 6px;
                                                          line-height: 10px;
                                                          padding: 0px 0px 0px
                                                            0px;
                                                        "
                                                        valign="top"
                                                        align="left"
                                                      >
                                                        <img
                                                          class="max-width"
                                                          border="0"
                                                          style="
                                                            display: block;
                                                            color: #000000;
                                                            text-decoration: none;
                                                            font-family: Helvetica,
                                                              arial, sans-serif;
                                                            font-size: 16px;
                                                          "
                                                          width="140"
                                                          alt=""
                                                          data-proportionally-constrained="true"
                                                          data-responsive="false"
                                                          src="https://www.vicel.co.uk/_next/image?url=%2Flogo.png&w=256&q=75"
                                                          height="40"
                                                        />
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                                <table
                                                  class="module"
                                                  role="module"
                                                  data-type="text"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  width="100%"
                                                  style="table-layout: fixed"
                                                  data-muid="1995753e-0c64-4075-b4ad-321980b82dfe"
                                                  data-mc-module-version="2019-10-22"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        style="
                                                          padding: 100px 0px
                                                            18px 0px;
                                                          line-height: 36px;
                                                          text-align: inherit;
                                                        "
                                                        height="100%"
                                                        valign="top"
                                                        bgcolor=""
                                                        role="module-content"
                                                      >
                                                        <div>
                                                          <div
                                                            style="
                                                              font-family: inherit;
                                                              text-align: inherit;
                                                            "
                                                          >
                                                            <span
                                                              style="
                                                                color: #000000;
                                                                font-size: 40px;
                                                                font-family: inherit;
                                                              ">
                                                              Thank you for signing up!</span>
                                                          </div>
                                                          <div></div>
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                                <table
                                                  class="module"
                                                  role="module"
                                                  data-type="text"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  width="100%"
                                                  style="table-layout: fixed"
                                                  data-muid="2ffbd984-f644-4c25-9a1e-ef76ac62a549"
                                                  data-mc-module-version="2019-10-22"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        style="
                                                          padding: 18px 20px
                                                            20px 0px;
                                                          line-height: 24px;
                                                          text-align: inherit;
                                                        "
                                                        height="100%"
                                                        valign="top"
                                                        bgcolor=""
                                                        role="module-content"
                                                      >
                                                        <div>
                                                          <div
                                                            style="
                                                              font-family: inherit;
                                                              text-align: inherit;
                                                            "
                                                          >
                                                            <span
                                                              style="
                                                                font-size: 24px;
                                                              "
                                                              >We are offering a 10% discount on your first booking. Use the code below at checkout to redeem your discount.</span
                                                            >
                                                          </div>
                                                          <div
                                                            style="
                                                              font-family: inherit;
                                                              text-align: inherit;
                                                            "
                                                          >
                                                            <span
                                                              style="
                                                                font-size: 24px;
                                                              "
                                                            ></span>
                                                          </div>
                                                          <div></div>
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                                <table
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  class="module"
                                                  data-role="module-button"
                                                  data-type="button"
                                                  role="module"
                                                  style="table-layout: fixed"
                                                  width="100%"
                                                  data-muid="69fc33ea-7c02-45ed-917a-b3b8a6866e89"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        align="left"
                                                        bgcolor=""
                                                        class="outer-td"
                                                        style="
                                                          padding: 0px 0px 0px
                                                            0px;
                                                        "
                                                      >
                                                      <div style="text-align: center;">
                                                        <p style="
                                                          font-size: 24px;
                                                          font-family: inherit;
                                                          color:darkgrey
                                                          ">Enter code at checkout</p>
                                                                <div
                                                                  style="
                                                                    text-align: center;
                                                                    margin-top: 2rem;
                                                                    margin-bottom: 4rem;
                                                                    background-color: #000000;
                                                                    border: 1px
                                                                      solid
                                                                      #000000;
                                                                    border-color: #000000;
                                                                    border-radius: 0px;
                                                                    border-width: 1px;
                                                                    color: #ffffff;
                                                                    display: inline-block;
                                                                    font-size: 18px;
                                                                    font-weight: normal;
                                                                    letter-spacing: 0px;
                                                                    line-height: normal;
                                                                    padding: 12px
                                                                      18px 12px
                                                                      18px;
                                                                    text-align: center;
                                                                    text-decoration: none;
                                                                    border-style: solid;
                                                                    font-family: inherit;
                                                                  "
                                                                  >${code}</div>
                                                                </div>
                                                                
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                                <div style="
                                                  margin-bottom: 2rem;
                                                  font-size: 1.2rem;
                                                  ">
                                                  We look forward to seeing you soon!
                                                </div>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <table
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  align="center"
                                  width="100%"
                                  role="module"
                                  data-type="columns"
                                  style="padding: 0px 20px 0px 30px"
                                  bgcolor="#FFFFFF"
                                  data-distribution="1,1,1,1"
                                >
                                  <tbody>
                                    <tr role="module-content">
                                      <td height="100%" valign="top">
                                        <table
                                          width="137"
                                          style="
                                            width: 137px;
                                            border-spacing: 0;
                                            border-collapse: collapse;
                                            margin: 0px 0px 0px 0px;
                                          "
                                          cellpadding="0"
                                          cellspacing="0"
                                          align="left"
                                          border="0"
                                          bgcolor=""
                                          class="column column-0"
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style="
                                                  padding: 0px;
                                                  margin: 0px;
                                                  border-spacing: 0;
                                                "
                                              >
                                                <table
                                                  class="wrapper"
                                                  role="module"
                                                  data-type="image"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  width="100%"
                                                  style="table-layout: fixed"
                                                  data-muid="239f10b7-5807-4e0b-8f01-f2b8d25ec9d7.1"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        style="
                                                          font-size: 6px;
                                                          line-height: 10px;
                                                          padding: 0px 0px 0px
                                                            0px;
                                                        "
                                                        valign="top"
                                                        align="left"
                                                      ></td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                
                                
                                        
                                        <table
                                          width="137"
                                          style="
                                            width: 137px;
                                            border-spacing: 0;
                                            border-collapse: collapse;
                                            margin: 0px 0px 0px 0px;
                                          "
                                          cellpadding="0"
                                          cellspacing="0"
                                          align="left"
                                          border="0"
                                          bgcolor=""
                                          class="column column-3"
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style="
                                                  padding: 0px;
                                                  margin: 0px;
                                                  border-spacing: 0;
                                                "
                                              ></td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                               
                                
                                
                                <table
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  align="center"
                                  width="100%"
                                  role="module"
                                  data-type="columns"
                                  style="padding: 0px 20px 0px 20px"
                                  bgcolor="#161c27"
                                  data-distribution="1,1,1,1"
                                >
                                  <tbody>
                                    <tr role="module-content">
                                      <td height="100%" valign="top">
                                        <table
                                          width="140"
                                          style="
                                            width: 140px;
                                            border-spacing: 0;
                                            border-collapse: collapse;
                                            margin: 0px 0px 0px 0px;
                                          "
                                          cellpadding="0"
                                          cellspacing="0"
                                          align="left"
                                          border="0"
                                          bgcolor=""
                                          class="column column-0"
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style="
                                                  padding: 0px;
                                                  margin: 0px;
                                                  border-spacing: 0;
                                                "
                                              >
                                                <table
                                                  class="module"
                                                  role="module"
                                                  data-type="text"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  width="100%"
                                                  style="table-layout: fixed"
                                                  data-muid="9d43ffa1-8e24-438b-9484-db553cf5b092"
                                                  data-mc-module-version="2019-10-22"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        style="
                                                          padding: 18px 0px 18px
                                                            0px;
                                                          line-height: 22px;
                                                          text-align: inherit;
                                                        "
                                                        height="100%"
                                                        valign="top"
                                                        bgcolor=""
                                                        role="module-content"
                                                      >
                                                        <div>
                                                          <div
                                                            style="
                                                              font-family: inherit;
                                                              text-align: center;
                                                            "
                                                          >
                                                            <a
                                                              href="https://vicel.co.uk/#FAQ"
                                                              ><span
                                                                style="
                                                                  color: #ffffff;
                                                                "
                                                                >FAQ</span
                                                              ></a
                                                            >
                                                          </div>
                                                          <div></div>
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <table
                                          width="140"
                                          style="
                                            width: 140px;
                                            border-spacing: 0;
                                            border-collapse: collapse;
                                            margin: 0px 0px 0px 0px;
                                          "
                                          cellpadding="0"
                                          cellspacing="0"
                                          align="left"
                                          border="0"
                                          bgcolor=""
                                          class="column column-1"
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style="
                                                  padding: 0px;
                                                  margin: 0px;
                                                  border-spacing: 0;
                                                "
                                              >
                                                <table
                                                  class="module"
                                                  role="module"
                                                  data-type="text"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  width="100%"
                                                  style="table-layout: fixed"
                                                  data-muid="9d43ffa1-8e24-438b-9484-db553cf5b092.1"
                                                  data-mc-module-version="2019-10-22"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        style="
                                                          padding: 18px 0px 18px
                                                            0px;
                                                          line-height: 22px;
                                                          text-align: inherit;
                                                        "
                                                        height="100%"
                                                        valign="top"
                                                        bgcolor=""
                                                        role="module-content"
                                                      >
                                                        <div>
                                                          <div
                                                            style="
                                                              font-family: inherit;
                                                              text-align: center;
                                                            "
                                                          >
                                                            <a
                                                              href="https://vicel.co.uk/#contact"
                                                              ><span
                                                                style="
                                                                  color: #ffffff;
                                                                "
                                                                >Contact
                                                                Us</span
                                                              ></a
                                                            >
                                                          </div>
                                                          <div></div>
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <table
                                          width="140"
                                          style="
                                            width: 140px;
                                            border-spacing: 0;
                                            border-collapse: collapse;
                                            margin: 0px 0px 0px 0px;
                                          "
                                          cellpadding="0"
                                          cellspacing="0"
                                          align="left"
                                          border="0"
                                          bgcolor=""
                                          class="column column-2"
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style="
                                                  padding: 0px;
                                                  margin: 0px;
                                                  border-spacing: 0;
                                                "
                                              >
                                                <table
                                                  class="module"
                                                  role="module"
                                                  data-type="text"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  width="100%"
                                                  style="table-layout: fixed"
                                                  data-muid="9d43ffa1-8e24-438b-9484-db553cf5b092.1.1"
                                                  data-mc-module-version="2019-10-22"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        style="
                                                          padding: 18px 0px 18px
                                                            0px;
                                                          line-height: 22px;
                                                          text-align: inherit;
                                                        "
                                                        height="100%"
                                                        valign="top"
                                                        bgcolor=""
                                                        role="module-content"
                                                      >
                                                        <div>
                                                          <div
                                                            style="
                                                              font-family: inherit;
                                                              text-align: center;
                                                            "
                                                          >
                                                            <a
                                                              href="http://https://vicel.co.uk/privacy"
                                                              ><span
                                                                style="
                                                                  color: #ffffff;
                                                                "
                                                                >Privacy</span
                                                              ></a
                                                            >
                                                          </div>
                                                          <div></div>
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <table
                                          width="140"
                                          style="
                                            width: 140px;
                                            border-spacing: 0;
                                            border-collapse: collapse;
                                            margin: 0px 0px 0px 0px;
                                          "
                                          cellpadding="0"
                                          cellspacing="0"
                                          align="left"
                                          border="0"
                                          bgcolor=""
                                          class="column column-3"
                                        >
                                          <tbody>
                                            <tr>
                                              <td
                                                style="
                                                  padding: 0px;
                                                  margin: 0px;
                                                  border-spacing: 0;
                                                "
                                              >
                                                <table
                                                  class="module"
                                                  role="module"
                                                  data-type="text"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  width="100%"
                                                  style="table-layout: fixed"
                                                  data-muid="9d43ffa1-8e24-438b-9484-db553cf5b092.1.1.1"
                                                  data-mc-module-version="2019-10-22"
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        style="
                                                          padding: 18px 0px 18px
                                                            0px;
                                                          line-height: 22px;
                                                          text-align: inherit;
                                                        "
                                                        height="100%"
                                                        valign="top"
                                                        bgcolor=""
                                                        role="module-content"
                                                      >
                                                        <div>
                                                          <div
                                                            style="
                                                              font-family: inherit;
                                                              text-align: center;
                                                            "
                                                          >
                                                            <a
                                                              href="https://vicel.co.uk/terms"
                                                              ><span
                                                                style="
                                                                  color: #ffffff;
                                                                "
                                                                >Terms</span
                                                              ></a
                                                            >
                                                          </div>
                                                          <div></div>
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <div
                                  data-role="module-unsubscribe"
                                  class="module"
                                  role="module"
                                  data-type="unsubscribe"
                                  style="
                                    background-color: #161c27;
                                    color: #ffffff;
                                    font-size: 12px;
                                    line-height: 20px;
                                    padding: 16px 16px 16px 16px;
                                    text-align: Center;
                                  "
                                  data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5"
                                >
                                  <div class="Unsubscribe--addressLine">
                                    <p
                                      class="Unsubscribe--senderName"
                                      style="font-size: 12px; line-height: 20px"
                                    >
                                      Vicel Ltd.
                                    </p>
                                    <p
                                      style="font-size: 12px; line-height: 20px"
                                    >
                                      <span class="Unsubscribe--senderCity"
                                        >Hemel Hempstead</span
                                      >,
                                      <span class="Unsubscribe--senderState"
                                        >Hertfordshire</span
                                      >,
                                      <span class="Unsubscribe--senderZip"
                                        >United Kingdom</span
                                      >
                                    </p>
                                  </div>
                                </div>
                                <table
                                  border="0"
                                  cellpadding="0"
                                  cellspacing="0"
                                  class="module"
                                  data-role="module-button"
                                  data-type="button"
                                  role="module"
                                  style="table-layout: fixed"
                                  width="100%"
                                  data-muid="e5cea269-a730-4c6b-8691-73d2709adc62"
                                ></table>
                              </td>
                            </tr>
                          </table>
                          <!--[if mso]>
                                  </td>
                                </tr>
                              </table>
                            </center>
                            <![endif]-->
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </center>
  </body>
</html>

        `,
      };
      sgMail
        .send(msg)
        .then(() => {
          console.log("Email sent");
          return { success: true };
        })
        .catch((err) => {
          console.log(err);
          return { success: false };
        });
    },
  });
