import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "/lib/dbClient";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const headersList = await headers();
    const origin = headersList.get("origin");
    // const origin = "https://trusting-chigger-smooth.ngrok-free.app"; // hardcoded for now
    const body = await req.json();

    console.log("Origin:", origin);

    // Get user data from Supabase by auth token
    const {
      data: { user },
    } = await supabase.auth.getUser(body.access_token);

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("user email>>>>", user.email);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price: "price_1RTpv73sA112T9gpQe6W8akO", // Replace with your real price ID
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?status=success`,
      cancel_url: `${origin}/dashboard?status=cancel`,
    });

    console.log(">>>>>session", session);
    console.log("Session URL:", session.url);

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}
