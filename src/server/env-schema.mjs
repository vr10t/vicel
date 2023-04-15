import { z } from "zod";

export const envSchema = z.object({
  // Specify your environment variables schema here
NEXT_PUBLIC_SUPABASE_URL: z.string(),
NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
NEXT_PUBLIC_STRIPE_API_KEY: z.string(),
STRIPE_SECRET_KEY: z.string(),
NEXT_PUBLIC_GOOGLE_API_KEY: z.string(),
SUPABASE_SERVICE_KEY: z.string(),
API_ROUTE_SECRET: z.string(),
STRIPE_SIGNING_SECRET: z.string(),
STRIPE_SG_SIGNING_SECRET: z.string(),
SITE_NAME: z.string(),
SENDGRID_API_KEY: z.string(),
MERGENT_API_KEY: z.string(),
NEXT_PUBLIC_HCAPTCHA_SITE_KEY: z.string(),
HCAPTCHA_SECRET_KEY: z.string(),
});
