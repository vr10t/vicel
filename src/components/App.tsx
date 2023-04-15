import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import UAParser from "ua-parser-js";
import { Text } from "@nextui-org/react";
import Reviews from "./Testimonials/Testimonials";
import Welcome from "./Welcome/Welcome";
import FAQ from "./FAQ/FAQ";
import Contact from "./Contact/Contact";
import Layout from "./Layout";
import FormV3 from "./Booking/Form";

function App() {

  const [isOldBrowser, setIsOldBrowser] = useState(false);

  function checkBrowserVersion(window: Window) {
    const parser = new UAParser(window.navigator.userAgent);
    const { version } = parser.getBrowser();
    const majorVersion = parseInt(version?.split(".")[0] ?? "", 10);
    const isSafari = parser.getEngine().name?.toLowerCase() === "webkit";
    if (majorVersion < 90) {
      if (isSafari) {
        if (majorVersion < 14) {
          return true;
        }
        return false;
      }
      return true;
    }
    return false;
  }
  useEffect(() => {
    setIsOldBrowser(checkBrowserVersion(window));
  }, [checkBrowserVersion]);

  return (
    <div>
      <Layout
        description="Experience top-notch, budget-friendly airport taxi services at Heathrow, Gatwick, Stansted, London Luton, and Birmingham airports."
        title="Affordable Vicel Airport Taxis - Hassle-Free Transfers | Book Now"
      >
        <Image
          aria-hidden="true"
          className="absolute bg-contain -top-20 z-[1]"
          priority
          src="/bg-2.jpg"
          width={1920}
          height={1280}
          alt="background"
        />
        <div
          className={` ${
            isOldBrowser ? "flex" : "hidden"
          } fixed top-20 left-0 w-screen justify-center p-1 items-center bg-red-600 z-[9999]`}
        >
          <Text size="3xl" className="text-white">
            Your browser is not supported. Please consider updating your browser
            to be able to use this website.
          </Text>
        </div>

        <div className="absolute top-0 w-full h-[64rem] backdrop-blur-sm blur-sm lg:h-[72rem] xl:h-[86rem] 2xl:h-[92rem] bg-gradient-to-b from-gray-50 via-sky-100/80 z-[2] to-transparent max-h-lg" />
        <FormV3 />
        <div className="relative z-0 hidden bg-gradient-to-b from-gray-900 to-transparent -top-2 md:block h-72 xl:h-44" />
        <div className="h-[40rem] md:hidden xs:h-[32rem] sm:mb-0 bg-gradient-to-b from-gray-900 to-transparent -top-2 relative z-0" />
        <Welcome />
        <Reviews />
        <FAQ />
        <Contact />
      </Layout>
    </div>
  );
}

export default App;
