/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as Yup from "yup";
import { Field, Formik, useFormik, Form, FormikErrors } from "formik";
import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { FaEnvelope } from "@react-icons/all-files/fa/FaEnvelope";
import { BsFillPersonFill } from "@react-icons/all-files/bs/BsFillPersonFill";
import { bookingStore, secureStore } from "../../store/bookingStore";
import userStore from "../../store/user";

export default function ContactDetails() {
  const { user } = userStore();
  const fullNameArray = user?.user_metadata?.name?.split(" ") || [];
  const firstName =
    user?.profile?.first_name ??
    fullNameArray[0] ??
    user?.user_metadata?.first_name;
  const lastName: string =
    user?.profile?.last_name ?? user?.user_metadata?.last_name;
  const {
    phone,
    setFirstName,
    setLastName,
    setEmail,
    setPhone,
  } = secureStore();

  const [phoneError, setPhoneError] = useState("");
  const [errors, setErrors] = useState({});

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
  function handleFormChange(values: any, formikErrors: any) {
    setFirstName(values.firstName);
    setLastName(values.lastName);
    setEmail(values.email);
    setErrors(formikErrors);
  }

  return (
    <div>
      <div className="h-4" />
      <Formik
        initialValues={{
          firstName: firstName as string,
          lastName,
          email: user?.email ?? "",
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
          acceptTerms: Yup.bool().oneOf([true], "Accept Ts & Cs is required"),
        })}
        onSubmit={(values, { setSubmitting }) => {
          setSubmitting(false);
          setFirstName(values.firstName);
          setLastName(values.lastName);
          setEmail(values.email);
        }}>
        {({ values, errors: formikErrors, touched }) => (
          <Form
            tabIndex={-2}
            onBlur={() => handleFormChange(values, formikErrors)}
            onChange={() => handleFormChange(values, formikErrors)}
            className="flex flex-col">
            <label htmlFor="firstName" className="label">
              First Name
            </label>
            {formikErrors.firstName && touched.firstName && (
              <div className="warning">
                <p>{formikErrors.firstName}</p>
              </div>
            )}
            <div className="input relative full">
              <span>
                <BsFillPersonFill className="z-0" />
              </span>

              <Field
                name="firstName"
                type="text"
                id="firstName"
                className={` field left ${
                  formikErrors.firstName && touched.firstName
                    ? "focus:ring-red-600 "
                    : "focus:ring-blue-700"
                }`}
                placeholder="Your first name"
              />
            </div>
            <label htmlFor="lastName" className="label">
              Last Name
            </label>
            {formikErrors.lastName && touched.lastName && (
              <div className="warning">
                <p>{formikErrors.lastName}</p>
              </div>
            )}
            <div className="input relative full">
              <span>
                <BsFillPersonFill className="z-0" />
              </span>

              <Field
                name="lastName"
                type="text"
                id="lastName"
                className={`field left ${
                  formikErrors.lastName && touched.lastName
                    ? "focus:ring-red-600 "
                    : "focus:ring-blue-600"
                }`}
                placeholder="Your last name"
              />
            </div>
            <label htmlFor="email" className="label">
              Email Address
            </label>
            {formikErrors.email && touched.email && (
              <div className="warning">
                <p>{formikErrors.email}</p>
              </div>
            )}
            <div className="input relative full">
              <span>
                <FaEnvelope className="z-0" />
              </span>

              <Field
                // {...getFieldProps("email")}
                //   onChange={formik.handleChange}
                //  value={formik.values.email}
                name="email"
                type="email"
                id="email"
                className={`field left ${
                  formikErrors.email && touched.email
                    ? "focus:ring-red-600 "
                    : "focus:ring-sky-600"
                }`}
                placeholder="Your email address"
              />
            </div>
          </Form>
        )}
      </Formik>
      <label htmlFor="phone" className="label">
        Phone
      </label>
      {phoneError && (
        <div className="warning">
          <p>{phoneError}</p>
        </div>
      )}
      <div className="flex relative w-full shadow-sm">
        <PhoneInput
          // {...getFieldProps("phone")}
          name="phone"
          id="phone"
          className="inline-flex items-center pl-2 w-full text-lg text-gray-900  bg-gray-50 rounded-lg border-r-2 shadow-sm appearance-none focus:outline-none focus:ring-2"
          defaultCountry="GB"
          initialValueFormat="national"
          placeholder="Your phone number"
          value={phone}
          error={phoneError}
          onChange={(e) => {
            if (e) setPhone(e.toString());
          }}
          onBlur={handlePhoneError}
        />
      </div>
    </div>
  );
}
