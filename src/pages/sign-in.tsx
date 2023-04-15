/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import * as Yup from "yup";
import { Field, Formik, useFormik, Form } from "formik";
import "react-phone-number-input/style.css";
import { FaEnvelope } from "@react-icons/all-files/fa/FaEnvelope";
import Image from "next/image";
import { FaLock } from "@react-icons/all-files/fa/FaLock";
import Link from "next/link";
import { Alert } from "flowbite-react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../utils/supabaseClient";
import Layout from "../components/Layout";

export default function SignIn() {
  const router = useRouter();

  const handleSubmit = async (ev: any) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: ev.email,
      password: ev.password,
    });
    if (!error) {
      const internalPathPattern = /^\/[^/].*/;
      const { referrer } = router.query
      if (referrer && internalPathPattern.test(referrer.toString())) {
        router.push(`${referrer}`);
      } else {
        router.push("/");
      }
    } else toast.error(error.message);
  };
  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  return (
    <Layout
      title={`Sign In to Vicel `}
      description="Sign in to Vicel to get access to your account and manage your orders">
      <div className="flex justify-center min-h-screen">
        <div className="z-20 flex flex-col w-full max-w-md px-4 py-8 my-8 bg-gray-50 rounded-lg shadow h-3/4 sm:px-6 md:px-8 lg:px-10">
          <div className="label lg self-center mb-2">Login</div>
          <span className="justify-center text-sm text-center text-gray-700 flex-items-center dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link passHref href="/sign-up">
              <a className="text-sm text-blue-500 underline hover:text-blue-700">
                Sign up
              </a>
            </Link>
          </span>
          <div className="mt-8">
            <Formik
              initialValues={{
                email: "",
                password: "",
              }}
              validationSchema={Yup.object().shape({
                email: Yup.string()
                  .required("Email is required")
                  .email("Email is invalid"),
                // password: Yup.string()
                // .required("Password is required")
                // .min(8,"Password is too short")
              })}
              onSubmit={handleSubmit}>
              {({
                setFieldValue,
                setFieldTouched,
                values,
                errors,
                touched,
              }) => (
                <Form className="flex flex-col ">
                  <label htmlFor="email" className="label ">
                    Email Address
                  </label>
                  {errors.email && touched.email && (
                    <div className="warning">
                      <p>{errors.email}</p>
                    </div>
                  )}
                  <div className="input full">
                    <span>
                      <FaEnvelope className="z-[2]" />
                    </span>

                    <Field
                      autoComplete="email"
                      name="email"
                      type="email"
                      id="email"
                      className={`field left ${
                        errors.email && touched.email
                          ? "focus:ring-red-600 "
                          : "focus:ring-blue-600"
                      }`}
                      placeholder="Your email address"
                    />
                  </div>
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  {errors.password && touched.password && (
                    <div className="warning">
                      <p>{errors.password}</p>
                    </div>
                  )}
                  <div className="input full">
                    <span>
                      <FaLock className="z-[2]" />
                    </span>

                    <Field
                      autoComplete="current-password"
                      name="password"
                      type="password"
                      id="password"
                      className={`field left ${
                        errors.password && touched.password
                          ? "focus:ring-red-600 "
                          : "focus:ring-blue-600"
                      }`}
                      placeholder="Your password"
                    />
                  </div>
                  <div className="flex justify-end w-full mt-4">
                    {" "}
                    <p className="text-sm font-light text-blue-700 ">
                      <Link href="/reset">Forgot password?</Link>
                    </p>
                  </div>
                  <div className="flex justify-center w-full py-4">
                    <button type="submit" className="btn lg w-5/6">
                      Login
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
          <p className="flex justify-center mb-4 text-gray-800 text-md">
            Or sign in with:
          </p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="btn lg red w-5/6 flex justify-center items-center mx-auto">
            <svg
              width="20"
              height="20"
              fill="currentColor"
              className="mr-2"
              viewBox="0 0 1792 1792"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M896 786h725q12 67 12 128 0 217-91 387.5t-259.5 266.5-386.5 96q-157 0-299-60.5t-245-163.5-163.5-245-60.5-299 60.5-299 163.5-245 245-163.5 299-60.5q300 0 515 201l-209 201q-123-119-306-119-129 0-238.5 65t-173.5 176.5-64 243.5 64 243.5 173.5 176.5 238.5 65q87 0 160-24t120-60 82-82 51.5-87 22.5-78h-436v-264z" />
            </svg>
            Google
          </button>
        </div>
      </div>
    </Layout>
  );
}
