"use client";

import ProtectedRoute from "/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { supabase } from "/lib/dbClient";

export default function DashboardPage() {
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

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <ProtectedRoute>
      <div className="p-4">
        <div className="flex justify-between">
          <h1 className="text-2xl mb-4">Dashboard</h1>
          <button
            className="mt-4 bg-red-500 text-white px-4 py-2"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>

        {user ? (
          <pre>{JSON.stringify(user, null, 2)}</pre>
        ) : (
          <p>Loading user...</p>
        )}
      </div>

      {!isSubscribed && (
        <div className="flex justify-center">
          <button
            className="mt-4 bg-green-600 text-white px-4 py-2"
            onClick={() => {
              window.location.href = "/dashboard/subscribe";
            }}
          >
            Subscribe to Premium
          </button>
        </div>
      )}
    </ProtectedRoute>
  );
}
