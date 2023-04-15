import { FaCheckCircle } from "@react-icons/all-files/fa/FaCheckCircle";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import create from "zustand";
import { useRouter } from "next/router";
import { persist } from "zustand/middleware";
import Layout from "../components/Layout";
import { supabase } from "../utils/supabaseClient";
import { trpc } from "../utils/trpc";

export default function EmailConfirm() {
  const promo = trpc.useMutation("promo.create");
  const sendPromoEmail = trpc.useMutation("promo.sendEmail");
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  const usePromoStore = create<{
    promoSent: boolean;
    setPromoSent: (promoSent: boolean) => void;
  }>()(
    persist(
      (set) => ({
        promoSent: false,
        setPromoSent: (promoSent: boolean) => set({ promoSent }),
      }),
      {
        name: "promo-storage", // name of item in the storage (must be unique)
        getStorage: () => sessionStorage, // (optional) by default the 'localStorage' is used
      }
    )
  );
  const { promoSent, setPromoSent } = usePromoStore();

  const userConfirmedLongAgo = dayjs(user?.confirmed_at).isBefore(
    dayjs().subtract(1, "hour")
  );

  async function getUser() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      // do nothing
    }
    if (data) {
      const { session } = data;
      if (session) {
        const { user: usr } = data.session;
        setUser(usr);
      }
    }
  }

  useEffect(() => {
    if (user) return;
    getUser();
  });

  useEffect(() => {
    if (!user) {
      getUser();
      return;
    }
    if (dayjs().diff(dayjs(user.email_confirmed_at), "second") > 30) return;
    if (promoSent) return;

    promo.mutate(
      { name: user?.email },
      {
        onSuccess: (data) => {
          sendPromoEmail.mutate(
            {
              code: data.id,
              email: user?.email ?? "",
            },
            {
              onSuccess: () => {
                setPromoSent(true);
              },
            }
          );
        },
        onError: () => {
          //do nothing
        },
      }
    );
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen py-2 -mt-24 text-center">
          <h1 className="text-6xl font-bold">Loading...</h1>
        </div>
      </Layout>
    );
  }

  if (userConfirmedLongAgo || promoSent) {
    router.push("/");
  }

  return (
    <Layout title={`Thank you `}>
      <div className="flex flex-col min-h-screen p-4 mt-20 ">
        {
          //if booking status is confirmed
          <div className="text-center">
            <div className="flex justify-center w-full mb-10 text-6xl font-bold">
              <FaCheckCircle className="z-0 text-green-500" />
            </div>
            <h1 className="mb-4 text-4xl font-medium text-blue-600">
              Thank you for signing up
              {user?.user_metadata?.first_name
                ? ` ${user?.user_metadata?.first_name}`
                : ""}
              !
            </h1>

            <h6>You will receive an email with your discount code shortly.</h6>
            <Link className="mt-4 bg-red-500 text-blue-700" href="/">
              Go to booking
            </Link>
          </div>
        }
      </div>
    </Layout>
  );
}
