"use client";
import { supabase } from "/lib/dbClient";
import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const features = [
    {
      name: "Unlimited tips",
      premium: true,
      free: "2 tips per team only",
    },
    {
      name: "Access to future developments",
      premium: true,
      free: false,
    },
  ];

  return (
    <div className="p-4">
      <h1 className="scroll-m-20 text-center  my-4 text-4xl font-extrabold tracking-tight text-balance">
        Features
      </h1>
      <div className="my-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Premium Card */}
        <div className="rounded-xl border border-yellow-400 bg-yellow-50 p-6 shadow-md">
          <h2 className="text-2xl font-semibold text-yellow-800">Premium</h2>
          <p className="mt-2 text-sm text-yellow-700">
            Unlock all features and get the most out of the platform.
          </p>
          <ul className="mt-4 space-y-3">
            {features.map((feature) => (
              <li key={feature.name} className="flex items-start gap-2">
                <Check className="text-green-600 mt-1" size={20} />
                <span className="text-gray-800">{feature.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Free Card */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800">Free</h2>
          <p className="mt-2 text-sm text-gray-600">
            Basic access with limited features.
          </p>
          <ul className="mt-4 space-y-3">
            {features.map((feature) => (
              <li key={feature.name} className="flex items-start gap-2">
                {feature.free ? (
                  <>
                    <X className="text-red-500 mt-1" size={20} />
                    <span className="text-gray-700">
                      {typeof feature.free === "string"
                        ? feature.free
                        : feature.name}
                    </span>
                  </>
                ) : (
                  <>
                    <X className="text-red-500 mt-1" size={20} />
                    <span className="text-gray-700 line-through">
                      {feature.name}
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 space-x-4 flex w-full justify-center">
        <Button
          onClick={() => {
            window.location.href = "/login";
          }}
        >
          Login
        </Button>
        <Button
          onClick={() => {
            window.location.href = "/dashboard/subscribe";
          }}
          className="bg-[#83B8C6] text-gray-950"
        >
          Subscribe
        </Button>
      </div>
    </div>
  );
}
