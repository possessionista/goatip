import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });

    let customer;
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({ email });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
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

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error("Stripe session creation failed", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
