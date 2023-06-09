import { NextApiRequest, NextApiResponse } from 'next';

import Stripe from 'stripe';
import { env } from '../../../server/env.mjs';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2022-11-15',
});

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id: string = req.query.id as string;
  try {
    if (!id.startsWith('cs_')) {
      throw Error('Incorrect CheckoutSession ID.');
    }
    const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.retrieve(
      id,
      { expand: ['payment_intent'] }
    );

    res.status(200).json(checkoutSession);
  } catch (err:any) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
}
export default handler