"use client";
import { useState } from "react";
import Script from "next/script";
import { ImProfile } from "react-icons/im";
import useAuthStore from "@/store/authStore";
import axios from "axios";
import { ToastContainer ,toast} from "react-toastify";
const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

declare global {
  interface Window {
    Razorpay: any;
  }
}

function Payment() {
  const [amount, setAmount] = useState("0");
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(false);

  const {user} = useAuthStore()
  // const { setPayment } = useStore();

  const createOrderId = async () => {
    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 500 * 100,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data.orderId;
    } catch (error) {
      console.error("There was a problem with your fetch operation:", error);
    }
  };
  const processPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const orderId: string = await createOrderId();
      const options = {
        key: process.env.key_id,
        amount: 500 * 100,
        currency: currency,
        name: user.username || "User",
        description: "description",
        order_id: orderId,
        handler: async function (response: any) {
          const data = {
            orderCreationId: orderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          const result = await fetch("/api/verify", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          });
          const res = await result.json();
          if (res.isOk) {
            const data = axios.post(`${BASE_URL}/api/payment`,{ email :user?.email},)
            toast.success("payment succeed", {
              position: "top-center",
            });
            // setPayment(false)
            console.log("sdsdsd");
          } else {
            alert(res.message);
          }
        },
        prefill: {
          name: user.username,
          email: user.email,
        },
        theme: {
          color: "#3399cc",
        },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        alert(response.error.description);
      });
      paymentObject.open();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      <section className=" ">
        <form className="" onSubmit={processPayment}>
          <button type="submit" className="text-yellow-600 underline">
            {" "}
            <ImProfile
              className="text-green-400 hover:text-white mb-1"
              size={20}
            />{" "}
          </button>
        </form>
      </section>
    </>
  );
}

export default Payment;