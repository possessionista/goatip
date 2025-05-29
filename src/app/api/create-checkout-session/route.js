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
    // You can fetch user data from Supabase using the token here if needed

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price: "price_1RU7G1KLz2CTgBMbJQ7enDno", // already created in Stripe Dashboard
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    });

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error("Stripe session creation failed", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
