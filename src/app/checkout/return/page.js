"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function CheckoutReturnPage() {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const router = useRouter();

  useEffect(() => {
    const fetchSessionStatus = async () => {
      const res = await fetch(`/api/session-status?session_id=${sessionId}`);
      const data = await res.json();

      setSessionData(data);
      setLoading(false);
    };

    if (sessionId) {
      fetchSessionStatus();
    }
  }, [sessionId]);

  if (loading) return <p>Checking payment status...</p>;

  if (!sessionData || sessionData.error) {
    return <p>Something went wrong. Please try again.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-2">Payment {sessionData.status}</h1>
      <p>Status: {sessionData.payment_status}</p>
      {sessionData.customer_email && <p>Email: {sessionData.customer_email}</p>}
    </div>
  );
}
