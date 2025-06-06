"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "/lib/dbClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: "hash",
        type: "email",
      });

      if (error) {
        console.error("Error parsing tokens from URL", error);
      }

      router.replace("/dashboard");
    };

    handleAuthRedirect();
  }, [router]);

  return (
    <div className="p-4">
      <p>Logging you in...</p>
    </div>
  );
}
