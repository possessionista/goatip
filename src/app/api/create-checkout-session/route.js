import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { access_token } = await request.json();

  if (!access_token) {
    return NextResponse.json(
      { error: "No access token provided" },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
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
