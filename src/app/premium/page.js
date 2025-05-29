"use client";
import { supabase } from "/lib/dbClient";

export default function Premium() {
  const handleSubscribe = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({ access_token: session.access_token }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.redirected) {
      window.location.href = res.url;
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">Become a Premium Member</h1>
      <ul className="list-disc ml-6 text-gray-700">
        <li>✅ Full access to all daily betting tips</li>
        <li>✅ Filter tips by accuracy and history</li>
        <li>✅ Track your profits over time</li>
      </ul>

      <button
        onClick={handleSubscribe}
        className="mt-6 bg-green-600 text-white px-4 py-2 rounded"
      >
        Subscribe Now
      </button>
    </main>
  );
}
