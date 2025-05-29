"use client";

import { useState } from "react";
import { supabase } from "/lib/dbClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("orogin>>>>", `${window.location.origin}/auth/callback`);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for a login link!");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleLogin}>
        <input
          className="border p-2 w-full mb-2"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 w-full"
          type="submit"
        >
          Send Magic Link
        </button>
      </form>
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
