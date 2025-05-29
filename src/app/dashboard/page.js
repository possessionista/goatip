"use client";

import ProtectedRoute from "/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { supabase } from "/lib/dbClient";

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error) {
        setUser(data.user);
      }
    };

    getUser();
  }, []);

  const handleSubscribe = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({ access_token: session.access_token }),
      headers: { "Content-Type": "application/json" },
    });

    // No need to parse JSON – it'll redirect
    if (res.redirected) {
      window.location.href = res.url;
    }
  };

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
      <div className="flex justify-center">
        <button
          className="mt-4 bg-green-600 text-white px-4 py-2"
          onClick={handleSubscribe}
        >
          Subscribe to Premium
        </button>
      </div>
    </ProtectedRoute>
  );
}
