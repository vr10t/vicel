import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
import { CssBaseline } from "@nextui-org/react";
import React from "react";

export default function Document() {
  const strucutredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Vicel",
    image: ["https://www.vicel.co.uk/_next/image?url=%2Fbg-2.jpg&w=1920&q=75"],
    telephone: "01442250000",
    email: "contact@vicel.co.uk",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hemel Hempstead",
      addressRegion: "Hertfordshire",
      postalCode: "HP1 1QG",
      addressCountry: "UK",
    },
    areaServed: "UK",
    priceRange: "£",
    paymentAccepted: "Cash, Card",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "3.7",
      ratingCount: "1",
    },
    description:
      "Vicel is an airport transfer company based in Hemel Hempstead, Hertfordshire. We provide a reliable, professional and affordable service to and from all major airports in the UK.",
    identifier: {
      "@type": "PropertyValue",
      name: "Vicel",
      value: "https://www.vicel.co.uk",
    },
    keywords:
      "airport transfer, airport transfers, airport taxi, airport taxis, airport minicab, airport minicabs, airport minibus, airport minibuses, airport shuttle, airport shuttles, airport coach, airport coaches, airport coach hire, airport coach hires, airport coach transfer ",
    logo: "https://www.vicel.co.uk/logo.png",
    mainEntityOfPage: "https://www.vicel.co.uk",
    url: "https://www.vicel.co.uk",
    slogan: "Here for you",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
    ],
  };
  return (
    <Html lang="en">
      <Head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="
      default-src 'self';
      img-src 'self' data: https:; 
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com https://*.googleapis.com https://*.googletagmanager.com https://*.supabase.co https://*.cookiebot.com https://*.stripe.com;
      style-src 'self' 'unsafe-inline';
      font-src 'self' data:;
      connect-src 'self' *.googleapis.com https://*.supabase.co https://*.cookiebot.com https://*.google-analytics.com https://*.vercel-insights.com ;
      object-src 'none';
      frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://*.googleapis.com https://*.cookiebot.com https://*.stripe.com;
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
    "
        />
        <Script
          strategy="beforeInteractive"
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="4c1bb22f-3ea3-46ec-9a07-dfea19c36438"
          data-blockingmode="auto"
          type="text/javascript"
        />
        {CssBaseline.flush()}
        {/* <Script strategy='beforeInteractive' src="https://js.hcaptcha.com/1/api.js" async defer /> */}
      </Head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(strucutredData) }}
        />

        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
