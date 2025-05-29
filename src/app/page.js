export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl">Welcome to Daily Bet Tips</h1>
      <p className="mt-4 text-gray-600">
        Get free and premium betting tips every day.
      </p>

      <div className="mt-6 space-x-4">
        <a href="/free" className="underline text-blue-600">
          See Free Tips
        </a>
        <a href="/premium" className="underline text-green-600">
          Become Premium
        </a>
      </div>
    </main>
  );
}
