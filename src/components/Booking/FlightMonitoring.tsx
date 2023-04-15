/* eslint-disable object-shorthand */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from "react";
import * as Yup from "yup";
import { Form, Formik, Field } from "formik";
import { bookingStore } from "../../store/bookingStore";

export default function FlightMonitoring() {
  const {
    airline_name,
    flight_number,
    plane_arriving_from,
    setPlaneArrivingFrom,
    setAirlineName,
    setFlightNumber,
  } = bookingStore();

  function handleFormChange(values: any, errors: any) {
    setPlaneArrivingFrom(values.plane_arriving_from);
    setAirlineName(values.airline_name);
    setFlightNumber(values.flight_number);
  }

  return (
    <div>
      <Formik
        initialValues={{
          plane_arriving_from: plane_arriving_from,
          airline_name: airline_name,
          flight_number: flight_number,
        }}
        validationSchema={Yup.object().shape({
          plane_arriving_from: Yup.string().required(
            "Please enter the name of the airport from where the plane is arriving"
          ),
          airline_name: Yup.string().required("Airline name is required"),
          flight_number: Yup.string().required(
            "Please enter the flight number (e.g. RYR 1234)"
          ),
        })}
        onSubmit={(values) => {
          setPlaneArrivingFrom(values.plane_arriving_from);
          setAirlineName(values.airline_name);
          setFlightNumber(values.flight_number);
        }}>
        {({ getFieldProps, values, errors, touched }) => (
          <Form
            onBlur={() => handleFormChange(values, errors)}
            onChange={() => handleFormChange(values, errors)}>
            <div className="my-4">
              <p className="grow label lg"> FLIGHT DETAILS</p>
            </div>
            <label htmlFor="plane_arriving_from" className="label">
              Plane Arriving From
            </label>
            {errors.plane_arriving_from && touched.plane_arriving_from && (
              <p className="warning">{errors.plane_arriving_from}</p>
            )}
            <div className="input full relative">
              <Field
                {...getFieldProps("plane_arriving_from")}
                name="plane_arriving_from"
                type="text"
                id="plane_arriving_from"
                className={`field ${
                  errors.plane_arriving_from && touched.plane_arriving_from
                    ? "focus:ring-red-600 "
                    : "focus:ring-blue-600"
                }`}
                placeholder="Airport Name"
              />
              {errors.plane_arriving_from && touched.plane_arriving_from && (
                <div className="absolute pointer-events-none  w-full h-full rounded-lg ring-2 ring-red-600" />
              )}
            </div>

            <label htmlFor="plane_arriving_from" className="label">
              Airline Name
            </label>
            {errors.airline_name && touched.airline_name && (
              <p className="warning">{errors.airline_name}</p>
            )}
            <div className="input full relative">
              <Field
                {...getFieldProps("airline_name")}
                name="airline_name"
                type="text"
                id="airline_name"
                className={`field ${
                  errors.airline_name && touched.airline_name
                    ? "focus:ring-red-600 "
                    : "focus:ring-blue-600"
                }`}
                placeholder="e.g. Ryanair"
              />
              {errors.airline_name && touched.airline_name && (
                <div className="absolute pointer-events-none  w-full h-full rounded-lg ring-2 ring-red-600" />
              )}
            </div>

            <div>
              <label htmlFor="plane_arriving_from" className="label">
                Flight Number
              </label>
              {errors.flight_number && touched.flight_number && (
                <p className="warning">{errors.flight_number}</p>
              )}
              <div className="input full relative">
                <Field
                  {...getFieldProps("flight_number")}
                  name="flight_number"
                  type="text"
                  id="flight_number"
                  className={`field ${
                    errors.flight_number && touched.flight_number
                      ? "focus:ring-red-600 "
                      : "focus:ring-blue-600"
                  }`}
                  placeholder="e.g. RYR 1234"
                />
                {errors.flight_number && touched.flight_number && (
                  <div className="absolute pointer-events-none  w-full h-full rounded-lg ring-2 ring-pink-400" />
                )}
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
