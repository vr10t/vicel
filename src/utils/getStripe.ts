import { Stripe, loadStripe } from '@stripe/stripe-js';
import { env } from '../server/env.mjs';

let stripePromise: Promise<Stripe | null> | null 
const getStripe = async () => {
  if (!stripePromise) {
    stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_API_KEY);
  }
  return stripePromise;
};

export default getStripe;