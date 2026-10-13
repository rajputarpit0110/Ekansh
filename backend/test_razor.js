import Razorpay from "razorpay";

async function run() {
  try {
    const rzp = new Razorpay({
      key_id: 'rzp_test_SvitQw7Q6AZmVP',
      key_secret: 'I5iU48RMiX14pT67V30Fq5mM'
    });
    const order = await rzp.orders.create({
      amount: 100,
      currency: "INR",
      receipt: "rcpt_1"
    });
    console.log("Success! Order ID:", order.id);
  } catch (e) {
    console.error("Crash!", e);
  }
}
run();
