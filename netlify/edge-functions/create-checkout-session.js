import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// List of EU country codes (ISO 3166-1 alpha-2)
const EU_COUNTRIES = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
];

function getRegionFromCountry(countryCode) {
  if (!countryCode) return "US";
  if (countryCode === "US") return "US";
  if (countryCode === "BR") return "BR";
  if (EU_COUNTRIES.includes(countryCode)) return "EU";
  return "US";
}

function getPriceCodeForRegion(region) {
  switch (region) {
    case "US":
      return process.env.US_PRICE_CODE;
    case "BR":
      return process.env.BR_PRICE_CODE;
    case "EU":
      return process.env.EU_PRICE_CODE;
    default:
      return process.env.US_PRICE_CODE;
  }
}

export default async (request, context) => {
  // Handle CORS for preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { email } = await request.json();

    // --- Netlify Edge Function Geolocation ---
    const country = context.geo?.country;
    console.log("Netlify detected country:", country);

    const region = getRegionFromCountry(country);
    console.log("Detected region:", region);

    const priceCode = getPriceCodeForRegion(region);
    console.log("Selected price code:", priceCode);

    let session;

    if (email) {
      // Look up or create persistent customer
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      });
      const customer =
        existingCustomers.data[0] ?? (await stripe.customers.create({ email }));

      session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: priceCode,
            quantity: 1,
          },
        ],
        ui_mode: "embedded",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      });
    } else {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: priceCode,
            quantity: 1,
          },
        ],
        //customer_creation: "always",
        ui_mode: "embedded",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      });
    }

    return new Response(
      JSON.stringify({ clientSecret: session.client_secret }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("Stripe session creation failed", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};
