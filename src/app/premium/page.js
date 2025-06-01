"use client";
import { supabase } from "/lib/dbClient";
import { useEffect, useState } from "react";

export default function Premium() {
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserAndSubscription = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        setLoading(false);
        return;
      }

      setUser(data.user);

      // Check subscription status
      const res = await fetch("/api/check-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.user.email }),
      }).catch((err) => {
        console.error("Fetch failed:", err);
      });

      const result = await res.json();

      setIsSubscribed(result.isSubscribed);
      setLoading(false);
    };

    getUserAndSubscription();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl mb-4">Become a Premium Member</h1>
      <ul className="list-disc ml-6 text-gray-700">
        <li>✅ Full access to all daily betting tips</li>
        <li>✅ Filter tips by accuracy and history</li>
        <li>✅ Track your profits over time</li>
      </ul>

      {!isSubscribed && (
        <button
          onClick={() => {
            window.location.href = "/dashboard/subscribe";
          }}
          className="mt-6 bg-green-600 text-white px-4 py-2 rounded"
        >
          Subscribe Now
        </button>
      )}

      {isSubscribed && (
        <button
          onClick={() => {
            window.location.href = "/dashboard";
          }}
          className="mt-6 bg-green-600 text-white px-4 py-2 rounded"
        >
          See Tips
        </button>
      )}
    </main>
  );
}
