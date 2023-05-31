/* eslint-disable react/no-danger */
import { Text, Dropdown } from "@nextui-org/react";
import { Spinner } from "flowbite-react";
import { useRouter } from "next/router.js";
import React from "react";
import toast, { Toaster } from "react-hot-toast";
import ReactModal from "react-modal";
import Stripe from "stripe";
import Layout from "../../../components/Layout";
import { env } from "../../../server/env.mjs";
import userStore from "../../../store/user";
import { formatAmountForDisplay } from "../../../utils/stripe-helpers";
import { trpc } from "../../../utils/trpc";
import SignIn from "../../sign-in";

export default function Cancel() {
  const { user } = userStore();
  const router = useRouter();
  const { id, secret, session_id } = router.query;
  const [error, setError] = React.useState("");
  const [session, setSession] = React.useState<Stripe.Checkout.Session | null>(
    null
  );
  const [isOpen, setIsOpen] = React.useState(false);
  const getSession = trpc.useMutation("stripe.getCheckoutSession", {
    onSuccess(data) {
      console.log(data);
      setSession(data as Stripe.Checkout.Session);
    },
    onError(e) {
      console.log(e);
      toast.error(e.message);
      setError(e.message);
    },
  });

  const cancelBooking = trpc.useMutation("cancel.withPaymentIntent", {
    onSuccess(data) {
      console.log(data);
      toast.success("Booking cancelled");
    },
    onError(e) {
      toast.error(e.message);
      console.log(e);
    },
  });
  const {data:booking }= trpc.useQuery(["bookings.single", { id: id as string, secret:secret as string }], {
    enabled: !!id && !!secret,
  })
  const { data: isAdmin } = trpc.useQuery(
    ["user.isAdmin", { id: user?.id ?? "" }],
    {
      enabled: !!user?.id,
    }
  );
  const fetchSession = React.useCallback(async () => {
    getSession.mutate({
      secret: secret as string,
      checkout_session_id: session_id as string,
    });
  }, [getSession, secret, session_id]);

  React.useEffect(() => {
    if (session_id && secret) {
      fetchSession();
    }
  }, [session_id, secret]);

  const [reason, setReason] = React.useState("");

  if (!id || !secret || !session_id) {
    return (
      <div>
        <h1>Missing query params</h1>
      </div>
    );
  }

  const reasons = [
    {
      reason: "Overbooking",
      description:
        "due to an inadvertent overbooking situation, we had more reservations than available spaces, which unfortunately necessitated the cancellation of your booking.",
    },
    {
      reason: "Maintenance Issues",
      description:
        "your booking was cancelled due to unexpected maintenance requirements, which have made our service temporarily unavailable.",
    },
    {
      reason: "Weather Conditions",
      description:
        "your booking was cancelled due to severe weather conditions, which made it unsafe to proceed with the scheduled service.",
    },
    {
      reason: "Operational Changes",
      description:
        "operational changes within our schedule necessitated the cancellation of your booking.",
    },
    {
      reason: "Regulatory or Policy Changes",
      description:
        "newly implemented regulations or policy changes have required us to cancel your booking.",
    },
    {
      reason: "Global Events",
      description:
        "in light of recent global events, we have had to cancel your booking.",
    },
    {
      reason: "Other",
      description: "due to unforeseen circumstances, your recent booking with us has been cancelled.",
    },
  ];
  const reasonsDict: Record<string, string> = reasons.reduce(
    (
      obj: Record<string, string>,
      item: { reason: string; description: string }
    ) => {
      // eslint-disable-next-line no-param-reassign
      obj[item.reason] = item.description;
      return obj;
    },
    {}
  );
  console.log(booking)

  const handleRefund = async () => {
    if (!session) {
      toast.error("Something went wrong");
      return;
    }
    cancelBooking.mutate({
      paymentIntent: session.payment_intent as string,
      secret: secret as string,
      reason: reasonsDict[reason] || reasonsDict.Other,
      name: session.metadata?.name as string,
      task_id: booking[0]!.task_id ,
    });
  };
  if (!user) {
    return (
      <div>
        <SignIn />
      </div>
    );
  }


  if (session) {
    if (isAdmin) {
      return (
        <Layout>
          {error && <p>{error}</p>}
          <ReactModal
            isOpen={isOpen}
            className="flex items-center z-[99999] justify-center h-64 px-4 mx-auto mt-40 align-middle bg-white rounded w-max ring-1 ring-black/20">
            <div className="flex flex-col items-center justify-center">
              Are you sure you want to cancel this booking? <br />
              {session.amount_total &&
                `The customer will be refunded ${formatAmountForDisplay(
                  session.amount_total / 100,
                  session.currency
                )}`}
              <div className="flex justify-between w-1/2 mt-4">
                <button
                  type="button"
                  className="text-gray-800"
                  onClick={() => setIsOpen(false)}>
                  Go back
                </button>
                <button
                  type="button"
                  className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                  onClick={handleRefund}>
                  Cancel
                </button>
              </div>
            </div>
          </ReactModal>
          <div className="flex flex-col p-2">
            <Text>{session.metadata?.name}</Text>
            <Text>{session.metadata?.email}</Text>
            <Text>{session.metadata?.dateTime}</Text>
            <Text>{session.metadata?.grand}</Text>
            <Dropdown>
              <Dropdown.Button flat>{reason || "Reason"}</Dropdown.Button>
              <Dropdown.Menu aria-label="Static Actions">
                {Object.keys(reasonsDict).map((r) => (
                <Dropdown.Item className="border-2 mb-2 h-full" key={r}>
                  <button
                    className="w-full"
                    type="button"
                    onClick={() => setReason(r)}>
                        {r}
                  </button>
                </Dropdown.Item>) )}
              </Dropdown.Menu>
            </Dropdown>
            <button
              className="btn red w-full max-w-xs self-center"
              disabled={!!error}
              type="button"
              onClick={() => setIsOpen(true)}>
              Cancel
            </button>
          </div>
          <div className="flex flex-col items-center justify-center">
            Preview:
            <div
              className="p-2 m-4 ring-2 ring-gray-600 ring-inset"
              dangerouslySetInnerHTML={{
                __html: `
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
        }
        .content {
            margin: 20px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Your Booking Has Been Cancelled</h1>
    </div>
    <div class="content">
        <p>Dear ${session.metadata?.name},</p>
    <p>We regret to inform you that ${reasonsDict[reason] || reasonsDict.Other} We understand that this may cause inconvenience and we sincerely apologize for this.</p>

    <p>Please rest assured that a full refund has been issued to the original payment method.</p>

    <p>We would be more than happy to assist you in rebooking your reservation at a later date, or with any other accommodations you may need. Our customer service team is always here to help you.</p>

    <p>If you have any questions or concerns, please feel free to contact us at <a href="tel:+44 1442 250 000">+44 1442 250 000</a>  or <a href="mailto:contact@vicel.co.uk">contact@vicel.co.uk</a>.</p>

    <p>Again, we sincerely apologize for any inconvenience this may cause and we appreciate your understanding.</p>

    <p>Best regards,</p>
    <p>Vicel</p>
</div>
<div class="footer">
    <p>Thank you for choosing our services. We hope to serve you again in the future.</p>
</div>
</body>
</html> 
          `,
              }}
            />
          </div>
        </Layout>
      );
    }
    return (
      <div>
        <h1>Not authorised</h1>
      </div>
    );
  }
  return (
    <div>
      <Spinner />
    </div>
  );
}
