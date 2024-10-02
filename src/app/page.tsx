"use client";

import Image, { StaticImageData } from "next/image";
import native from "../../public/asset/native.png";
import study from "../../public/asset/class.png";
import plan from "../../public/plan.png";
import Link from "next/link";
import logo from "../../public/asset/verboflylogo.png";
import progress from "../../public/asset/progress.jpg";
import subscription from "../../public/asset/subscription.webp";
import videocall from "../../public/asset/videocall.jpg";
import features from "../../public/asset/features.webp";
import { BackgroundLines } from "@/components/ui/background-lines";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowTurnDown,
  FaFacebook,
  FaGoogle,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa6";
import { IconType } from "react-icons";

interface SocialIconProps {
  href: string;
  Icon: IconType;
  color: string;
}

export default function Home() {
  const [showButtons, setShowButtons] = useState(false);
  const router = useRouter();
  const featuresRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButtons(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const scrollToFeatures = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-black from-blue-100 to-white text-white font-sans">
      <BackgroundLines className="h-screen relative">
        <div className="absolute left-4 top-4 sm:top-[-3rem] w-1/3 sm:w-1/4 md:w-1/5">
          <Image src={logo} alt="TalkTrek" layout="responsive" className="cursor-pointer" onClick={()=>router.push('/')} />
        </div>
        <div className="flex font-bold absolute top-4 right-4 sm:top-12 sm:right-6 space-x-4 sm:space-x-6 text-sm sm:text-base">
          <h2 className="cursor-pointer" onClick={()=> router.push('/dashboard')}>DASHBOARD</h2>
          <h2 className="cursor-pointer" onClick={()=> router.push('/about')}>ABOUT US</h2>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div className="text-center mb-8">
            <TypewriterEffectSmooth
              words={[
                { text: "Ready" },
                { text: "to" },
                { text: "Start" },
                { text: "Your" },
                { text: "Language", className: "text-blue-500" },
                { text: "Journey", className: "text-green-500" },
                { text: "with" },
                { text: "Verbofly?", className: "text-purple-500" },
              ]}
            />
          </div>
          <div
            className={`space-x-4 text-sm sm:text-base transition-opacity duration-1000 ${
              showButtons ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              className="border border-white px-4 sm:px-6 py-2 rounded-xl hover:text-black hover:bg-yellow-500 hover:border-transparent transition-colors"
              onClick={() => router.push("/signup")}
            >
              Join now
            </button>
            <button
              className="border bg-white text-black px-4 sm:px-6 py-2 rounded-xl hover:text-black hover:bg-yellow-500 hover:border-transparent transition-colors"
              onClick={() => router.push("/login")}
            >
              SignIn
            </button>
          </div>
        </div>
      </BackgroundLines>

      <section className="bg-black bg-opacity-90 py-12 sm:py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Learn Any Language with Native Speakers
          </h1>
          <p className="text-base sm:text-lg mb-8 text-yellow-400">
            Your all-in-one platform for language learning and cultural exchange
          </p>
          <ul className="mb-8 text-sm sm:text-base space-y-2">
            <li className="text-yellow-500">
              ✓ <span className="text-white">Study multiple languages</span>
            </li>
            <li className="text-yellow-500">
              ✓{" "}
              <span className="text-white">Access lessons, quiz, and more</span>
            </li>
            <li className="text-yellow-500">
              ✓ <span className="text-white">Track your progress</span>
            </li>
            <li className="text-yellow-500">
              ✓{" "}
              <span className="text-white">
                Connect with native speakers globally
              </span>
            </li>
            <li className="text-yellow-500">
              ✓{" "}
              <span className="text-white">
                Make chat, video call, group chat,...
              </span>
            </li>
            <li className="text-yellow-500">
              ✓{" "}
              <span className="text-white">
                Translate any language to your favourite one
              </span>
            </li>
            <li className="text-yellow-500">
              ✓{" "}
              <span className="text-white">
                Get subscription & enjoy more features
              </span>
            </li>
            <li>and more </li>
          </ul>
          <button
            className="flex items-center justify-center mx-auto text-white px-6 sm:px-8 py-2 rounded-full text-sm sm:text-lg border border-white hover:bg-white hover:text-black transition-colors"
            onClick={scrollToFeatures}
          >
            View all features <FaArrowTurnDown className="ml-2" />
          </button>
        </div>
      </section>

      <section ref={featuresRef} className="py-12 sm:py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-8 sm:mb-12">
            Our Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              image={study}
              title="Access Predefined Video Classes"
              description="Enhance your learning with our curated video lessons taught by experienced language instructors."
            />
            <FeatureCard
              image={features}
              title="Learn any language with additional features"
              description="Explore a wide range of tools and resources to support your language learning journey."
            />
            <FeatureCard
              image={progress}
              title="Track Your Progress"
              description="Monitor your language learning journey with detailed analytics and personalized insights."
            />
            <FeatureCard
              image={native}
              title="Connect with Native Speakers"
              description="Find language partners, send requests, and practice with fluent speakers from around the globe."
            />
            <FeatureCard
              image={videocall}
              title="Make calls and improve communication"
              description="Practice speaking through video calls and enhance your conversational skills."
            />
            <FeatureCard
              image={subscription}
              title="Upgrade Your Experience"
              description="Subscribe to unlock premium features and enjoy a seamless language learning journey."
            />
          </div>
        </div>
      </section>

      <div id="how-it-works" className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-gray-700 text-darkBlue p-6 rounded-lg shadow-md text-center">
              <div className="bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Sign Up</h3>
              <p>Create your profile and set your language goals.</p>
            </div>
            <div className="bg-gray-700 text-darkBlue p-6 rounded-lg shadow-md text-center">
              <div className="bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Connect</h3>
              <p>Find native speakers and send connection requests.</p>
            </div>
            <div className="bg-gray-700 text-darkBlue p-6 rounded-lg shadow-md text-center">
              <div className="bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Learn</h3>
              <p>Take lessons and practice through conversations.</p>
            </div>
            <div className="bg-gray-700 text-darkBlue p-6 rounded-lg shadow-md text-center">
              <div className="bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Improve</h3>
              <p>Track your progress and reach fluency faster.</p>
            </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Ready to Start Your Language Journey?
        </h2>
        <div className="flex justify-center">
          <Link href="/signup">
            <button className="btn-grad text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-lg transition duration-300 ease-in-out transform hover:scale-105">
              Start Your Language Journey
            </button>
          </Link>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="w-32 sm:w-40 md:w-50">
              <Image
                src={logo}
                alt="TalkTrek"
                width={100}
                height={67}
                layout="responsive"
                objectFit="contain"
                priority
              />
            </div>
            <nav className="order-3 md:order-2 w-full md:w-auto">
              <ul className="flex flex-wrap justify-center space-x-4 md:space-x-6">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
              <div className="mt-6 text-center text-xs sm:text-sm text-gray-400">
                <p>
                  &copy; {new Date().getFullYear()} Verbofly. All rights reserved.
                </p>
              </div>
            </nav>
            <div className="order-2 md:order-3 flex space-x-4">
              <SocialIcon
                href="https://google.com"
                Icon={FaGoogle}
                color="text-red-600"
              />
              <SocialIcon
                href="https://facebook.com"
                Icon={FaFacebook}
                color="text-blue-600"
              />
              <SocialIcon
                href="https://twitter.com"
                Icon={FaTwitter}
                color="text-blue-400"
              />
              <SocialIcon
                href="https://instagram.com"
                Icon={FaInstagram}
                color="text-pink-600"
              />
             </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

const SocialIcon: React.FC<SocialIconProps> = ({ href, Icon, color }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`${color} hover:text-white transition-colors`}
  >
    <Icon className="w-6 h-6" />
  </a>
);

interface FeatureCardProps {
  image: StaticImageData;
  title: string;
  description: string;
}

function FeatureCard({ image, title, description }: FeatureCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105">
      <div className="h-48 overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={500}
          height={300}
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  );
}
