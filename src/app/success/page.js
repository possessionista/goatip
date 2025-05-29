export default function SuccessPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-green-600">Payment Successful</h1>
      <p className="mt-4">Thank you! Your payment was successful.</p>
      <a
        href="/dashboard"
        className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded"
      >
        Go to Dashboard
      </a>
    </div>
  );
}
