import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const TARGET_PRICE_ID = "price_1RUAx1KLz2CTgBMbDRWEpruE";

export async function POST(request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
    // Get customer
    const customers = await stripe.customers.list({ limit: 10 });
    if (!customers.data.length) {
      return NextResponse.json({ isSubscribed: false });
    }

    const customer = customers.data[0];

    let startingAfter = null;

    while (true) {
      const response = await stripe.checkout.sessions.list({
        customer: customer.id,
        limit: 100,
        ...(startingAfter && { starting_after: startingAfter }),
      });

      for (const session of response.data) {
        if (session.payment_status !== "paid") continue;

        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id,
          {
            limit: 10,
          }
        );

        const hasTargetProduct = lineItems.data.some(
          (item) => item.price?.id === TARGET_PRICE_ID
        );

        if (hasTargetProduct) {
          return NextResponse.json({ isSubscribed: true });
        }
      }

      if (!response.has_more) break;
      startingAfter = response.data[response.data.length - 1].id;
    }

    return NextResponse.json({ isSubscribed: false });
  } catch (err) {
    console.error("Subscription check error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
