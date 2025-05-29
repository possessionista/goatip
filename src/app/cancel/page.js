export default function CancelPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-red-600">Payment Cancelled</h1>
      <p className="mt-4">Your payment was not completed.</p>
      <a
        href="/dashboard"
        className="mt-6 inline-block bg-gray-600 text-white px-4 py-2 rounded"
      >
        Go to Dashboard
      </a>
    </div>
  );
}
