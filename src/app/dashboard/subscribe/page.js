import EmbeddedCheckoutWrapper from "/components/EmbeddedCheckout";

export default function SubscribePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Subscribe</h1>
      <EmbeddedCheckoutWrapper />
    </div>
  );
}
