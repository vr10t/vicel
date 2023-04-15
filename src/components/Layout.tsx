import Head from "next/head";
import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { Loader } from "@googlemaps/js-api-loader";
import Navbar from "./Navbar/V2";
import Footer from "./Footer/Footer";
import { secureStore } from "../store/bookingStore";

type Props = {
  children: ReactNode;
  // eslint-disable-next-line react/require-default-props
  title?: string;
  // eslint-disable-next-line react/require-default-props
  description?: string;
};

declare var globalThis: any;

function Layout({ children, title, description }: Props) {
  const fullTitle = `${title ? `${title}` : ""} ${title?.toLocaleLowerCase().includes("vicel")? "" : " | Vicel"}`;
  const router = useRouter();
  const url = router.asPath.split("?")[0].split("#")[0];
  const canonical = `https://www.vicel.co.uk${url}`;
  const {setGoogle } = secureStore()
  
  useEffect(() => {
    if (globalThis.google) return;
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
      version: "weekly",
      libraries: ["places"],
    });
    loader.load().then((google) => {
      setGoogle(google)
    });
  }, []);


  return (
    <>
      <Head>
        <link rel="canonical" href={canonical} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="language" content="en" />
        <meta name="description" content={description || ""} />

        <title>{fullTitle}</title>

        <meta name="og:title" content={fullTitle} />
        <meta name="og:description" content={description || ""} />
        <meta name="og:image" content="https://www.vicel.co.uk/og-image.png" />
        <meta name="og:url" content="https://www.vicel.co.uk" />
        <meta name="og:type" content="website" />
        <meta name="og:locale" content="en_GB" />
        <meta name="twitter:site" content="@viceltaxi" />
        <meta name="twitter:title" content={fullTitle} />
        <meta
          name="twitter:description"
          content="Experience top-notch, budget-friendly airport taxi services at Heathrow, Gatwick, Stansted, London Luton, and Birmingham airports. Book online for reliable transfers and unbeatable prices."
        />
        <meta
          name="twitter:image"
          content="https://www.vicel.co.uk/og-image.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Navbar />
      <div className="h-20 bg-transparent" />
      <main className="min-h-screen overflow-x-hidden">{children}</main>
      <Footer />
    </>
  );
}
export default Layout;
