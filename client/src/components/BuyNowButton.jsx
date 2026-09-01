import { api } from "../store/api";

export default function BuyNowButton({ exam }) {
  const buyExam = async () => {
    try {
      const res = await api.post("/payments/orders", {
        examId: exam._id,
      });

      const order = res.data.data;

      const razorpay = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Competition Exams Notes",
        description: order.exam.title,
        order_id: order.orderId,

        handler: async (response) => {
          await api.post("/payments/verify", response);

          alert("✅ Payment Successful");
          window.location.reload();
        },

        theme: {
          color: "#4F46E5",
        },
      });

      razorpay.open();
    } catch (err) {
      console.error("Purchase Error:", err.response?.data);

      alert(
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        err.message
      );
    }
  };

  return (
    <button
      onClick={buyExam}
      className="w-full rounded-lg bg-indigo-600 py-3 text-white hover:bg-indigo-700"
    >
      Buy Now ₹{exam.discountPrice || exam.price}
    </button>
  );
}