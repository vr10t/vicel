import React, { Children } from "react";
import Head from "next/head";
import Script from "next/script";
import App from "../components/App";
import { trpc } from "../utils/trpc";
import userStore from "../store/user";
import FormV3 from "../components/Booking/Form";

export default function Home({ children }: any) {
  // const {data, isLoading} = trpc.useQuery(["user.session", {}], );

  return (
    <>
      <Head>{children}</Head>

      <App />
    </>
  );
}
