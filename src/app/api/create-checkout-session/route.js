import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { email } = await request.json();

  try {
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
        customer: customer.id, // Persistent customer
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price: "price_1RUAx1KLz2CTgBMbDRWEpruE",
            quantity: 1,
          },
        ],
        ui_mode: "embedded",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      });
    } else {
      // No customer yet, but collect email in Stripe Checkout and create real customer (not Guest)
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price: "price_1RUAx1KLz2CTgBMbDRWEpruE",
            quantity: 1,
          },
        ],
        customer_creation: "always",
        ui_mode: "embedded",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      });
    }

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error("Stripe session creation failed", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
