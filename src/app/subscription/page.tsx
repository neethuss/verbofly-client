"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import useAuthStore from "@/store/authStore";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Image from "next/image";
import SubscriptionImage from "../../../public/asset/subscription.png";
import { TiTick } from "react-icons/ti";
import { GiProgression } from "react-icons/gi";
import { FaUsers } from "react-icons/fa";
import { CiSquareQuestion } from "react-icons/ci";
import UserNav from "@/components/UserNav";
import { useRouter } from "next/navigation";
import { fetchUser } from "@/services/userApi";
import { User } from "@/Types/chat";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function Subscription() {
  const {logout} = useAuthStore()
  const [amount, setAmount] = useState("0");
  const [currentUser, setCurrentUser] = useState<User>()
  const [currency, setCurrency] = useState("INR");
  const [subscribed, setSubscribed] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    const fetchCurrentUser = async () => {
      console.log('useEffect in subscription')
      try {
        const data = await fetchUser(token as string);
        setCurrentUser(data)
        setSubscribed(data.isSubscribed);
        const date = new Date(data.expirationDate);
        setExpiryDate(date);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            if (error.response.status === 403) {
              toast.error("User is blocked");
              logout()
            }else if (error.response.status === 401) {
              toast.error("Token expired");
              logout()
            }
          } else {
            toast.error("An unexpected error occurred in login");
          }
        } else {
          toast.error("An error occurred during login. Please try again.");
        }
      }
    };
    fetchCurrentUser();
  }, [subscribed, logout]);

  const createOrderId = async () => {
    try {
  ;
      const response = await fetch("/api/order", {
        
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 199 * 100,
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
  const processPayment = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const orderId: string = await createOrderId();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: 199 * 100,
        currency: currency,
        name: currentUser?.username || "User",
        description: "description",
        order_id: orderId,
        handler: async function (paymentresponse: any) {
          const data = {
            orderCreationId: orderId,
            razorpayPaymentId: paymentresponse.razorpay_payment_id,
            razorpayOrderId: paymentresponse.razorpay_order_id,
            razorpaySignature: paymentresponse.razorpay_signature,
          };
          const result = await fetch("/api/verify", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          });
          const res = await result.json();
          if (res.isOk) {
            try {
              console.log("object");
              const response = await axios.patch(
                `${BACKEND_URL}/api/payment/update-subscription`,
                {
                  email: currentUser?.email,
                  orderId: paymentresponse.razorpay_order_id,
                },
                {
                  headers: {
                    Authorization: localStorage.getItem("userAccessToken"),
                  },
                }
              );

              if (response.status === 200) {
                setSubscribed(true);
                const date = new Date(response.data.expirationDate);
                setExpiryDate(date);
                toast.success("Payment succeeded and subscription updated!", {
                  position: "top-center",
                });
              } else {
                toast.error(
                  "Payment succeeded, but failed to update subscription.",
                  {
                    position: "top-center",
                  }
                );
              }
            } catch (error) {
              console.error("Error updating subscription:", error);
              toast.error("Error updating subscription.", {
                position: "top-center",
              });
            }
            console.log("sdsdsd");
          } else {
            alert(res.message);
          }
        },
        prefill: {
          name: currentUser?.username,
          email: currentUser?.email,
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

      <div className="flex min-h-screen bg-gray-900 text-white font-sans">
        <UserNav />

        <main className="flex flex-1 justify-center flex-col items-center p-8">
          <h1 className="text-4xl font-bold mb-8">Subscription</h1>

          {!subscribed ? (
            <div className="bg-gray-800 rounded-lg p-6 flex flex-col md:flex-row items-center shadow-lg transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl max-w-4xl w-full">
              <div className="md:w-1/2 p-6">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400">
                  Standard Plan
                </h2>
                <p className="text-3xl font-bold mb-4">
                  ₹199<span className="text-sm font-normal">/month</span>
                </p>
                <ul className="space-y-4">
                  {[
                    "Access to All Lessons",
                    "Find unlimited connections",
                    "Get updated with upcoming features",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center space-x-4">
                      <div className="bg-yellow-400 text-black rounded-full w-5 h-5 flex items-center justify-center">
                        <TiTick />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className="mt-8 px-6 py-2 bg-yellow-400 text-black rounded-full hover:bg-yellow-500 transition duration-300"
                  onClick={processPayment}
                >
                  Subscribe Now
                </button>
              </div>
              <div className="md:w-1/2 flex items-center justify-center">
                <Image
                  src={SubscriptionImage}
                  alt="Subscription"
                  width={300}
                  height={300}
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center shadow-lg transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl max-w-4xl w-full">
              <div className="text-yellow-400 text-6xl mb-4">
                <TiTick />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-yellow-400">
                Active Subscription
              </h2>
              <p className="text-center mb-4">
                Your Standard Plan is active until{" "}
                <span className="font-bold text-yellow-400">
                  {expiryDate ? expiryDate.toLocaleDateString() : "N/A"}
                </span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <FeatureCard
                  icon={
                    <GiProgression className="text-yellow-400 text-4xl mb-4" />
                  }
                  title="All Lessons"
                  description="Access to all language learning content"
                />
                <FeatureCard
                  icon={<FaUsers className="text-yellow-400 text-4xl mb-4" />}
                  title="Unlimited Connections"
                  description="Connect with as many native speakers as you want"
                />
                <FeatureCard
                  icon={
                    <CiSquareQuestion className="text-yellow-400 text-4xl mb-4" />
                  }
                  title="Upcoming Features"
                  description="Get early access to new features"
                />
              </div>
            </div>
          )}
        </main>
      </div>
      <ToastContainer theme="dark" />
    </>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => (
  <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center text-center">
    {icon}
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm">{description}</p>
  </div>
);

export default Subscription;
