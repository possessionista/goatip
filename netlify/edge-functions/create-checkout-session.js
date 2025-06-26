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
  console.log("Country code entering function:", countryCode);
  if (!countryCode) return "US";
  if (countryCode === "US") return "US";
  if (countryCode === "BR") return "BR";
  if (EU_COUNTRIES.includes(countryCode)) return "EU";
  return "US";
}

function getPriceCodeForRegion(region) {
  switch (region) {
    case "US":
      return Deno.env.get("US_PRICE_CODE");
    case "BR":
      return Deno.env.get("BR_PRICE_CODE");
    case "EU":
      return Deno.env.get("EU_PRICE_CODE");
    default:
      return Deno.env.get("US_PRICE_CODE");
  }
}

// Stripe REST API helper functions
async function stripeRequest(endpoint, method = "GET", data = null) {
  const url = `https://api.stripe.com/v1/${endpoint}`;
  const headers = {
    Authorization: `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const options = {
    method,
    headers,
  };

  if (data && method !== "GET") {
    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    }
    options.body = formData.toString();
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Stripe API error:", response.status, errorText);
    throw new Error(`Stripe API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function findOrCreateCustomer(email) {
  try {
    // Try to find existing customer
    const customers = await stripeRequest(
      `customers?email=${encodeURIComponent(email)}&limit=1`
    );

    if (customers.data && customers.data.length > 0) {
      console.log("Found existing customer:", customers.data[0].id);
      return customers.data[0];
    }
  } catch (error) {
    console.log("Error finding customer, will create new one:", error.message);
  }

  // Create new customer
  const customer = await stripeRequest("customers", "POST", { email });
  console.log("Created new customer:", customer.id);
  return customer;
}

async function createCheckoutSession(customerId, priceCode, email = null) {
  const sessionData = {
    "payment_method_types[0]": "card",
    mode: "subscription",
    "line_items[0][price]": priceCode,
    "line_items[0][quantity]": "1",
    ui_mode: "embedded",
    return_url: `${Deno.env.get(
      "NEXT_PUBLIC_BASE_URL"
    )}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
  };

  if (customerId) {
    sessionData.customer = customerId;
  }
  /* else if (email) {
    sessionData.customer_creation = 'always';
  } */

  return stripeRequest("checkout/sessions", "POST", sessionData);
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
    const { code } = context.geo?.country;
    console.log("Netlify detected country:", code);

    const region = getRegionFromCountry(code);
    console.log("Detected region:", region);

    const priceCode = getPriceCodeForRegion(region);
    console.log("Selected price code:", priceCode);

    console.log("Down here! entering if");

    let session;

    if (email) {
      // Look up or create persistent customer
      const customer = await findOrCreateCustomer(email);

      session = await createCheckoutSession(customer.id, priceCode);
    } else {
      console.log("No email provided");
      session = await createCheckoutSession(null, priceCode, email);
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
