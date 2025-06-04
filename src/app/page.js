"use client";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="p-8">
      <div className="flex w-full">
        <h1 className="text-2xl mb-4">GOATIPS</h1>
      </div>
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        Welcome to Daily Bet Tips
      </h1>
      <p className="text-center mt-4 text-gray-600 scroll-m-20 text-xl font-semibold tracking-tight">
        Improve your bets with valuable picks.
      </p>

      <div className="mt-6 space-x-4 flex w-full justify-center">
        <Button
          onClick={() => {
            window.location.href = "/dashboard";
          }}
          className="bg-[#83B8C6] text-gray-950"
        >
          See Tips
        </Button>
        <Button
          onClick={() => {
            window.location.href = "/premium";
          }}
        >
          Premium Features
        </Button>
      </div>
    </main>
  );
}
