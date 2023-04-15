import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../utils/supabaseClient";
import Layout from "../components/Layout";

export default function ResetPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const notification = toast.loading("Sending Email....");

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://www.vicel.co.uk/password-reset",
      });

      if (error) {
        toast.error(error.message, {
          duration: 4000,
          id: notification,
        });
      } else if (data) {
        toast.success("Sent. Please check your inbox for the reset link.", {
          duration: 8000,
          id: notification,
        });
      }
    } catch (error: any) {
      toast.error(error.message, {
        duration: 4000,
        id: notification,
      });
    }
  };
  return (
    <Layout title="Find your account">
      <div className="w-5/6 mx-auto h-full rounded-lg my-10 py-10 bg-gray-50 shadow flex flex-col justify-self-center items-center">
        <h1 className="text-3xl font-bold">Let&apos;s find your account</h1>
        <p className="text-md text-gray-700 py-4">
          Please enter your email in the box below:
        </p>
        <form
          className="flex flex-col self-center items-center"
          onSubmit={(e) => handleSubmit(e)}>
          <input
            className="bg-gray-50 rounded-lg border-gray-600 focus:border-blue-600 appearance-none focus:ring-2 focus:ring-blue-600"
            autoComplete="email"
            type="email"
            placeholder="Please enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            className="btn lg mt-4"
            type="submit">
            Search
          </button>
        </form>
      </div>
    </Layout>
  );
}
