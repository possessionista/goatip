export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl">Welcome to Daily Bet Tips</h1>
      <p className="mt-4 text-gray-600">Get betting tips every day.</p>

      <div className="mt-6 space-x-4">
        <a href="/dashboard" className="underline text-blue-600">
          See Tips
        </a>
        <a href="/premium" className="underline text-green-600">
          Premium Features
        </a>
      </div>
    </main>
  );
}
