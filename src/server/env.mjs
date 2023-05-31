import { z } from "zod";

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */
const server = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]),
  SUPABASE_SERVICE_KEY: z.string(),
  API_ROUTE_SECRET: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_SIGNING_SECRET: z.string(),
  STRIPE_SG_SIGNING_SECRET: z.string(),
  SITE_NAME: z.string(),
  SENDGRID_API_KEY: z.string(),
  MERGENT_API_KEY: z.string(),
  HCAPTCHA_SECRET_KEY: z.string(),
  ACLASS_EMAIL: z.string(),
  BCC_EMAIL: z.string(),
  STRIPE_FW_SIGNING_SECRET: z.string(),
  ADMIN_ID: z.string(),
  FW_EMAIL: z.string(),
  STRIPE_REFUND_SIGNING_SECRET: z.string(),
  SECRET_GOOGLE_API_KEY: z.string(),
});

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_STRIPE_API_KEY: z.string(),
  NEXT_PUBLIC_GOOGLE_API_KEY: z.string(),
  NEXT_PUBLIC_HCAPTCHA_SITE_KEY: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
 * middlewares) or client-side so we need to destruct manually.
 *
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  ACLASS_EMAIL: process.env.ACLASS_EMAIL,
  ADMIN_ID: process.env.ADMIN_ID,
  API_ROUTE_SECRET: process.env.API_ROUTE_SECRET,
  BCC_EMAIL: process.env.BCC_EMAIL,
  HCAPTCHA_SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY,
  MERGENT_API_KEY: process.env.MERGENT_API_KEY,
  NEXT_PUBLIC_GOOGLE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  NEXT_PUBLIC_HCAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
  NEXT_PUBLIC_STRIPE_API_KEY: process.env.NEXT_PUBLIC_STRIPE_API_KEY,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SITE_NAME: process.env.SITE_NAME,
  STRIPE_FW_SIGNING_SECRET: process.env.STRIPE_FW_SIGNING_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_SG_SIGNING_SECRET: process.env.STRIPE_SG_SIGNING_SECRET,
  STRIPE_SIGNING_SECRET: process.env.STRIPE_SIGNING_SECRET,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  FW_EMAIL: process.env.FW_EMAIL,
  STRIPE_REFUND_SIGNING_SECRET: process.env.STRIPE_REFUND_SIGNING_SECRET,
  SECRET_GOOGLE_API_KEY: process.env.SECRET_GOOGLE_API_KEY,
};

// Don't touch the part below
// --------------------------

const merged = server.merge(client);

/** @typedef {z.input<typeof merged>} MergedInput */
/** @typedef {z.infer<typeof merged>} MergedOutput */
/** @typedef {z.SafeParseReturnType<MergedInput, MergedOutput>} MergedSafeParseReturn */

// eslint-disable-next-line import/no-mutable-exports, prefer-destructuring
let env = /** @type {MergedOutput} */ (process.env);

const skip =
    !!process.env.SKIP_ENV_VALIDATION &&
    process.env.SKIP_ENV_VALIDATION !== "false" &&
    process.env.SKIP_ENV_VALIDATION !== "0";
if (!skip) {
    const isServer = typeof window === "undefined";

    const parsed = /** @type {MergedSafeParseReturn} */ (
        isServer
            ? merged.safeParse(processEnv) // on server we can validate all env vars
            : client.safeParse(processEnv) // on client we can only validate the ones that are exposed
    );

    if (parsed.success === false) {
        console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
        throw new Error("Invalid environment variables");
    }

    // eslint-disable-next-line no-undef
    env = new Proxy(parsed.data, {
        get(target, prop) {
            if (typeof prop !== "string") return undefined;
            // Throw a descriptive error if a server-side env var is accessed on the client
            // Otherwise it would just be returning `undefined` and be annoying to debug
            if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
                throw new Error(
                    process.env.NODE_ENV === "production"
                        ? "❌ Attempted to access a server-side environment variable on the client"
                        : `❌ Attempted to access server-side environment variable '${prop}' on the client`,
                );
            return target[/** @type {keyof typeof target} */ (prop)];
        },
    });
}

export { env };