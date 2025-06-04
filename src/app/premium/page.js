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

  return (
    <main className="p-8">
      <div className="flex w-full">
        <h1 className="text-2xl mb-4">GOATIPS</h1>
      </div>

      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        Premium Features
      </h1>

      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="even:bg-muted m-0 border-t p-0">
              <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                Feature
              </th>
              <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                Premium
              </th>
              <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                Free
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="even:bg-muted m-0 border-t p-0">
              <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                Ilimited tips
              </td>
              <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                <Check />
              </td>
              <td className="flex border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                <X />2 tips per team only
              </td>
            </tr>
            <tr className="even:bg-muted m-0 border-t p-0">
              <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                Access to future developments
              </td>
              <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                <Check />
              </td>
              <td className="flex border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                <X />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex w-full justify-center">
        {!isSubscribed && (
          <Button
            onClick={() => {
              window.location.href = "/dashboard/subscribe";
            }}
            className="mt-6 bg-[#83B8C6] text-gray-950 px-4 py-2 rounded"
          >
            Subscribe Now
          </Button>
        )}

        {isSubscribed && (
          <Button
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            className="mt-6 bg-[#83B8C6] text-gray-950 px-4 py-2 rounded"
          >
            See Tips
          </Button>
        )}
      </div>
    </main>
  );
}
