import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Form, Formik, Field } from "formik";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

import { trpc } from "../../utils/trpc";
/* eslint-disable jsx-a11y/label-has-associated-control */
export default function Contact() {
  const send = trpc.useMutation("sendgrid.contact", {});
  const [captchaResponse, setCaptchaResponse] = useState("");
  type hcaptcha = {
    execute: () => void;
    resetCaptcha: () => void;
  };
  const captchaRef = useRef(null);

  const onLoad = () => {
    // this reaches out to the hCaptcha JS API and runs the
    // execute function on it. you can use other functions as
    // documented here:
    // https://docs.hcaptcha.com/configuration#jsapi
    // (captchaRef.current as unknown as hcaptcha)?.execute();
  };

  return (
    <div
      id="contact"
      className="px-5 py-10 mx-auto text-gray-900 my-12 shadow-md bg-gray-50 rounded-lg grid grid-cols-1 gap-8 md:grid-cols-2"
    >
      <div className="flex flex-col justify-center">
        <div>
          <p className="text-3xl font-bold tracking-tight text-gray-900 leading-8 sm:text-4xl">
            Still have questions?
          </p>
          <div className="mt-8 text-gray-700">
            Ask us anything and we will get back to you as soon as possible.
          </div>
          <div className="mt-8 text-gray-700">
            Alternatively, you can call us on 01442 250000 or message us on{" "}
            <Link
              href="https://wa.me/07577413490"
              className="text-red-500 underline"
            >
              <a
                className="underline text-blue-800"
                href="https://wa.me/07577413490"
              >
                WhatsApp
              </a>
            </Link>
          </div>
        </div>
        <div className="mt-12 text-center">
          <Image
            src="/front-page/contact.jpg"
            width={4076}
            height={2712}
            alt="Contact"
          />
        </div>
      </div>
      <Formik
        initialValues={{
          name: "",
          email: "",
          phone: "",
          message: "",
        }}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          const { name, email, phone, message } = values;
          if (captchaResponse) {
            send.mutateAsync(
              {
                captcha: captchaResponse,
                email,
                message,
                name,
                phone,
              },
              {
                onSuccess: () => {
                  toast.success("Message sent!");
                  resetForm();
                  (captchaRef.current as unknown as hcaptcha)?.resetCaptcha();
                },
                onError: (err) => {
                  toast.error(JSON.parse(err.message)[0].message);
                },
              }
            );
          } else {
            toast.error("Please verify you are not a robot");
          }
          setSubmitting(false);
        }}
      >
        {({ values, handleChange }) => (
          <Form>
            <div>
              <span className="label">
                Full Name
              </span>
              <Field
                className="field mt-2"
                type="text"
                placeholder="Enter your name"
                required
                name="name"
                id="name"
              />
            </div>
            <div className="mt-4">
              <span className="label">
                Email
              </span>
              <Field
                className="field mt-2"
                type="email"
                placeholder="Enter your email address"
                required
                name="email"
                id="email"
              />
            </div>
            <div className="mt-4">
              <span className="label">
                Phone Number
              </span>
              <Field
                className="field mt-2"
                type="tel"
                placeholder="Enter your phone number"
                required
                name="phone"
                id="phone"
              />
            </div>
            <div className="mt-4">
              <span className="label">
                Message
              </span>
              <textarea
                className="field mt-2 h-32"
                placeholder="Enter your Message"
                required
                name="message"
                id="message"
                value={values.message}
                onChange={handleChange}
              />
            </div>
            <div className="mt-8">
              <HCaptcha
                id="captcha"
                sitekey="63ecdeb2-95ea-4c7a-9e95-02195a81d5c5"
                onVerify={(e) => {
                  setCaptchaResponse(e);
                }}
                ref={captchaRef}
                onLoad={onLoad}
              />
              <button
                className="w-full mt-4 btn lg"
                type="submit"
              >
                Send Message
              </button>
            </div>
          </Form>
        )}
      </Formik>
  <style jsx>{`
  `}</style>
    </div>
  );
}
