/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useRef} from "react";
import * as Yup from "yup";
import { Field, Formik, Form } from "formik";
import PhoneInput, {
  isPossiblePhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { FaEnvelope } from "@react-icons/all-files/fa/FaEnvelope";
import { BsFillPersonFill } from "@react-icons/all-files/bs/BsFillPersonFill";
import { useRouter } from "next/router";
import { FaLock } from "@react-icons/all-files/fa/FaLock";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaAngleDown } from "@react-icons/all-files/fa/FaAngleDown";
import { supabase } from "../utils/supabaseClient";
import Layout from "../components/Layout";

export default function SignUp() {
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const termsRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { referrer } = router.query || "/";
  function handlePhoneError() {
    setPhoneError("");

    if (!phone) {
      setPhoneError("Phone number is required");
    }
    if (phone) {
      if (isPossiblePhoneNumber(phone) === false) {
        setPhoneError("Invalid phone number");
      } else {
        setPhoneError("");
      }
    }
  }
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      //
    });
  }, []);
  async function handleSubmit(ev: any) {
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email: ev.email,
      password: ev.password,
      options: {
        data: {
          first_name: ev.firstName,
          last_name: ev.lastName,
          phone,
          referrer,
        },
        emailRedirectTo: "https://www.vicel.co.uk/email-confirm",
        // emailRedirectTo: "http://localhost:3000/email-confirm",
      },
    });
    // if(user) router.push(referrer||"/")
    if (user)
      toast.success("Please check your email to verify your account", {});
    if (error) toast.error(error.message);
    // if (error) setLoginError(error.message)
  }
  async function signInWithGoogle() {
    if (termsRef.current) {
      if (termsRef.current.checked) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: "https://www.vicel.co.uk/email-confirm",
            // redirectTo: "http://localhost:3000/email-confirm",
          },
        });
      }
      // make sure accept terms box is checked
      else {
        toast.error("Please accept the terms and conditions", {
          duration: 4000,
        });
      }
    } else {
      toast.error("Something went wrong. Please try again in a few seconds", {
        duration: 5000,
      });
    }
  }

  return (
    <Layout
      title={`Sign Up `}
      description="Sign up to Vicel and make your next booking simple and easy.">
      <div className="flex justify-center ">
        <div className="z-20 bg-gray-50 flex flex-col w-full max-w-md px-4 py-8 mx-4 my-8 rounded-lg shadow h-3/4  sm:px-6 md:px-8 lg:px-10">
          <span className="justify-center text-sm text-center text-gray-700 flex-items-center dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/sign-in">
              <a className="text-sm text-blue-500 underline hover:text-blue-700">
                Sign in
              </a>
            </Link>
          </span>
          <details className="bg-gray-50 " open={referrer !== "/booking"}>
            <summary className="flex justify-center py-4 text-gray-800 list-none cursor-pointer hover:text-blue-700">
              Sign in with Google{" "}
              <FaAngleDown className="z-0 self-center pl-2" />
            </summary>
            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex items-center justify-center w-5/6 btn lg red mx-auto">
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
            <span className="flex justify-start py-2 gap-2 ">
              <input
                ref={termsRef}
                className="self-center w-5 h-5 cursor-pointer rounded-md"
                type="checkbox"
                name="acceptGoogleTerms"
                id="acceptGoogleTerms"
              />{" "}
              <label
                htmlFor="acceptGoogleTerms"
                className="self-center font-medium tracking-tight text-gray-700 cursor-pointer text-md">
                I agree to the
                <Link href="/terms">
                  <a className=" text-blue-700 hover:text-blue-600">
                    {" "}
                    Terms of Service{" "}
                  </a>
                </Link>
                and the
                <Link href="/privacy">
                  <a className=" text-blue-700 hover:text-blue-600">
                    {" "}
                    Privacy Policy{" "}
                  </a>
                </Link>{" "}
              </label>{" "}
            </span>
          </details>
          <p className="flex justify-center mb-4 tracking-wide text-gray-800">
            or{" "}
          </p>
          <details className="bg-gray-50 " open={referrer === "/booking"}>
            <summary className="flex justify-center text-gray-800 list-none cursor-pointer hover:text-blue-700">
              Sign up with email{" "}
              <FaAngleDown className="z-0 self-center pl-2" />
            </summary>
            <div className="mt-8">
              <Formik
                initialValues={{
                  firstName: "",
                  lastName: "",
                  email: "",
                  password: "",
                  repeat_password: "",
                  acceptTerms: false,
                }}
                validationSchema={Yup.object().shape({
                  firstName: Yup.string()
                    .required("Name is required")
                    .min(2, "Name is too short")
                    .max(50, "Name is too long")
                    .matches(
                      /^[A-z]+(([',. [a-z ][A-Z ])?[-]?[a-zA-Z]*)*$/,
                      "Name must not contain invalid characters"
                    ),

                  lastName: Yup.string()
                    .required("Name is required")
                    .min(2, "Name is too short")
                    .max(50, "Name is too long")
                    .matches(
                      /^[A-z]+(([',. [a-z ][A-Z ])?[-]?[a-zA-Z]*)*$/,
                      "Name must not contain invalid characters"
                    ),

                  email: Yup.string()
                    .required("Email is required")
                    .email("Email is invalid"),
                  password: Yup.string()
                    .required()
                    .min(8, "Password must be at least 8 characters")
                    .max(64, "Password is too long"),
                  repeat_password: Yup.string()
                    .required("Please confirm your password")
                    .oneOf([Yup.ref("password")], "Passwords do not match"),
                  acceptTerms: Yup.bool().oneOf(
                    [true],
                    "Accept Ts & Cs is required"
                  ),
                })}
                onSubmit={handleSubmit}>
                {({ errors, touched, values }) => (
                  <Form className="flex flex-col ">
                    <label htmlFor="firstName" className="label">
                      First Name
                    </label>
                    {errors.firstName && touched.firstName && (
                      <div className="warning">
                        <p>{errors.firstName}</p>
                      </div>
                    )}
                    <div className="input full">
                      <span>
                        <BsFillPersonFill className="z-[2]" />
                      </span>

                      <Field
                        autoComplete="given-name"
                        name="firstName"
                        type="text"
                        id="firstName"
                        className={`field left ${
                          errors.firstName && touched.firstName
                            ? "focus:ring-red-500 "
                            : "focus:ring-blue-600"
                        }`}
                        placeholder="Your first name"
                      />
                    </div>
                    <label htmlFor="lastName" className="label">
                      Last Name
                    </label>
                    {errors.lastName && touched.lastName && (
                      <div className="warning">
                        <p>{errors.lastName}</p>
                      </div>
                    )}
                    <div className="input full">
                      <span>
                        <BsFillPersonFill className="z-[2]" />
                      </span>

                      <Field
                        autoComplete="family-name"
                        name="lastName"
                        type="text"
                        id="lastName"
                        className={`field left ${
                          errors.lastName && touched.lastName
                            ? "focus:ring-red-500 "
                            : "focus:ring-blue-600"
                        }`}
                        placeholder="Your last name"
                      />
                    </div>
                    <label htmlFor="email" className="label">
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
                            ? "focus:ring-red-500 "
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
                        autoComplete="new-password"
                        name="password"
                        type="password"
                        id="password"
                        className={`field left ${
                          errors.password && touched.password
                            ? "focus:ring-red-500 "
                            : "focus:ring-blue-600"
                        }`}
                        placeholder="Your password"
                      />
                    </div>
                    <label htmlFor="repeat_password" className="label">
                      Repeat password
                    </label>
                    {errors.repeat_password && touched.repeat_password && (
                      <div className="warning">
                        <p>{errors.repeat_password}</p>
                      </div>
                    )}
                    <div className="input full">
                      <span>
                        <FaLock className="z-[2]" />
                      </span>

                      <Field
                        autoComplete="new-password"
                        name="repeat_password"
                        type="password"
                        id="repeat_password"
                        className={`field left ${
                          errors.repeat_password && touched.repeat_password
                            ? "focus:ring-red-500 "
                            : "focus:ring-blue-600"
                        }`}
                        placeholder="Repeat password"
                      />
                    </div>
                    <div className="">
                      <label htmlFor="phone" className="label">
                        Phone
                      </label>
                      {phoneError && (
                        <div className="warning">
                          <p>{phoneError}</p>
                        </div>
                      )}
                      <div className="input full">
                        <PhoneInput
                          // {...getFieldProps("phone")}
                          name="phone"
                          id="phone"
                          className="inline-flex items-center w-full pl-2 text-lg text-gray-900 border-r-2 rounded-lg appearance-none shadow-sm bg-white/50 focus:outline-none focus:ring-2"
                          defaultCountry="GB"
                          initialValueFormat="national"
                          placeholder="Your phone number"
                          value={phone}
                          error={phoneError}
                          onChange={(e: any) => setPhone(e)}
                          onBlur={handlePhoneError}
                        />
                      </div>
                    </div>

                    {errors.acceptTerms && touched.acceptTerms && (
                      <div className="warning">
                        <p>{errors.acceptTerms}</p>
                      </div>
                    )}
                    <span className="flex justify-start py-2 gap-2 ">
                      <Field
                        className="self-center w-5 h-5 cursor-pointer rounded-md"
                        type="checkbox"
                        name="acceptTerms"
                        id="acceptTerms"
                      />{" "}
                      <label
                        htmlFor="acceptTerms"
                        className="self-center font-medium tracking-tight text-gray-700 cursor-pointer text-md">
                        I agree to the
                        <Link href="/terms">
                          <a className=" text-blue-700 hover:text-blue-600">
                            {" "}
                            Terms of Service{" "}
                          </a>
                        </Link>
                        and the
                        <Link href="/privacy">
                          <a className=" text-blue-700 hover:text-blue-600">
                            {" "}
                            Privacy Policy{" "}
                          </a>
                        </Link>{" "}
                      </label>{" "}
                    </span>
                    <div className="flex justify-center w-full py-4">
                      <button
                        type="submit"
                        className="w-5/6 btn lg">
                        Create Your Account
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </details>
        </div>
      </div>
    </Layout>
  );
}
