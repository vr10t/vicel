import { User } from "@supabase/supabase-js";
import { withTRPC } from "@trpc/next";
import type { AppType } from "next/dist/shared/lib/utils";
import React, { useEffect } from "react";
import superjson from "superjson";
import { throttle } from "throttle-debounce";
import Script from "next/script";
import { NextUIProvider } from "@nextui-org/react";
import type { AppRouter } from "../server/router";
import userStore from "../store/user";
import "../styles/globals.css";
import { supabase } from "../utils/supabaseClient";

// eslint-disable-next-line import/no-mutable-exports
export let token: string | undefined;

// eslint-disable-next-line react/function-component-definition, react/jsx-props-no-spreading
const MyApp: AppType = ({ Component, pageProps }) => (
  <>
    {/*<!-- Google Tag (gtag.js) - Google Analytics -->*/}
    <Script
      src="https://www.googletagmanager.com/gtag/js?id=G-EJGPWSJBM9"
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
         window.dataLayer = window.dataLayer || [];
         function gtag(){window.dataLayer.push(arguments);}
         gtag('js', new Date());

         gtag('config', 'G-EJGPWSJBM9');
       `}
    </Script>
    <NextUIProvider>
      {/*eslint-disable-next-line react/jsx-props-no-spreading*/}
      <Component {...pageProps} />
    </NextUIProvider>
  </>
);

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.browser) return ""; // Browser should use current path
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const sbUser = supabase.auth.getSession();

    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      transformer: superjson,

      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
export { reportWebVitals } from "next-axiom";
