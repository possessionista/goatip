import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get all price codes from environment variables
const PRICE_CODES = [
  process.env.US_PRICE_CODE,
  process.env.BR_PRICE_CODE,
  process.env.EU_PRICE_CODE,
].filter(Boolean); // Remove any undefined values

export async function POST(request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
    // Find customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (!customers.data.length) {
      console.log("No customer found for email:", email);
      return NextResponse.json({ isSubscribed: false });
    }

    const customer = customers.data[0];
    console.log("Found customer:", customer.id);

    // Get all active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 100,
    });

    console.log("Found subscriptions:", subscriptions.data.length);

    // Check if any subscription has one of our target price codes
    for (const subscription of subscriptions.data) {
      console.log("Checking subscription:", subscription.id);
      
      for (const item of subscription.items.data) {
        console.log("Checking subscription item price:", item.price.id);
        
        if (PRICE_CODES.includes(item.price.id)) {
          console.log("Found matching subscription for price:", item.price.id);
          return NextResponse.json({ 
            isSubscribed: true,
            subscriptionId: subscription.id,
            priceId: item.price.id,
            status: subscription.status
          });
        }
      }
    }

    console.log("No active subscription found for any target price codes");
    return NextResponse.json({ isSubscribed: false });

  } catch (err) {
    console.error("Subscription check error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
