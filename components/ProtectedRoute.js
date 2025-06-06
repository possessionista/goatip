"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "/lib/dbClient";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (data?.user) {
        setIsAuthenticated(true);
      } else {
        router.replace("/login");
      }

      setLoading(false);
    };

    //checkAuth();
    setLoading(false);
  }, [router]);

  if (loading) return <p className="p-4">Checking auth...</p>;

  //return isAuthenticated ? children : null
  return children;
}
