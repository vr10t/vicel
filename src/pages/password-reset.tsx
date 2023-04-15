import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useFormik, useField } from "formik";
import * as Yup from "yup";

import { User } from "@supabase/supabase-js";
import Layout from "../components/Layout";
import { supabase } from "../utils/supabaseClient";
import { trpc } from "../utils/trpc";

function PasswordReset() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  async function getUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  }
  const resetPassword = trpc.useMutation("user.resetPassword");
  useEffect(() => {
    getUser();
  }, []);

  const formik = useFormik({
    initialValues: {
      password: "",
      repeatPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, "Must be 8 characters or more")
        .required("Required"),
      repeatPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      if (!user) return;

      resetPassword
        .mutateAsync({
          user_id: user.id,
          password: values.password,
        })
        .then((data) => {
          if (data.error) {
            toast.error(data.error.message);
          } else {
            toast.success("Password reset successfully");
            router.push("/my-account");
          }
        });
    },
  });
  const [error, setError] = useState("");
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(window.location.hash);
  }, []);
  useEffect(() => {
    supabase.auth
      .initialize()
      .then(({ error: err }) => {
        if (err) {
          toast.error(err.message);
          setError(err.message);
        }
      })
      .catch((err) => {
        toast.error(err.message);
        setError(err.message);
      })
      .finally(() => {
        window.location.hash = "";
      });
  }, [hash]);
  return (
    <Layout title="Reset your password">
      {!hash ||
        (error && (
          <p className="text-xl flex justify-center mx-auto pt-10 text-gray-900 font-medium bg-gray-100 pb-96">
            {error || "Sorry, invalid token."}
          </p>
        ))}
      {hash && !error && (
        <div className="w-5/6 mx-auto h-full rounded-lg my-10 py-10 bg-gray-50 flex flex-col justify-self-center items-center">
          <h1 className="text-3xl font-bold">Reset Your Password</h1>
          <p className="text-md text-gray-700 py-4 px-4">
            Please enter your new password in the box below:
          </p>
          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col self-center items-center gap-1">
            <span className="text-sm ml-1 text-red-600 self-start">
              {formik.errors.password}
            </span>
            <input
              className={`bg-gray-50 rounded-lg ${
                formik.errors.password ? "border-red-500" : "border-gray-600"
              } focus:border-blue-600 appearance-none focus:ring-2 focus:ring-blue-600`}
              autoComplete="new-password"
              type="password"
              name="password"
              placeholder="Please enter your new password"
              value={formik.values.password}
              onChange={formik.handleChange}
            />
            <span className="text-sm ml-1 text-red-600 self-start">
              {formik.errors.repeatPassword}
            </span>
            <input
              className={`bg-gray-50 rounded-lg ${
                formik.errors.repeatPassword
                  ? "border-red-500"
                  : "border-gray-600"
              } focus:border-blue-600 appearance-none focus:ring-2 focus:ring-blue-600`}
              autoComplete="repeat-password"
              type="password"
              name="repeatPassword"
              placeholder="Please repeat the password"
              value={formik.values.repeatPassword}
              onChange={formik.handleChange}
            />
            <button
              disabled={formik.isSubmitting || !user}
              className="btn lg mt-4"
              type="submit">
              Submit
            </button>
          </form>{" "}
        </div>
      )}
    </Layout>
  );
}

export default PasswordReset;
