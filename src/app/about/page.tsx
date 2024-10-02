"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const AboutUs = () => {
  const router = useRouter();

  return (
    <div className="bg-gray-900 text-white font-sans min-h-screen">
      <header className="container mx-auto px-4  flex justify-between items-center">
        <div className="w-40 cursor-pointer" onClick={() => router.push("/")}>
          <Image
            src="/asset/verboflylogo.png"
            alt="Verbofly"
            width={160}
            height={40}
            layout="responsive"
          />
        </div>
      </header>

      <main className="container mx-auto px-4">
        <section id="about" className="py-2">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-8">ABOUT US</h1>
              <p className="mb-4">
                Welcome to Verbofly&apos; where language learning and cultural
                exchange converge. Founded in 2024, we believe language is the
                key to global understanding and personal growth.
              </p>
              <p className="mb-4">
                We&apos;ve reimagined language learning for the digital age, creating
                an interactive ecosystem for learners of all levels. Our
                platform combines cutting-edge technology with human connection,
                catering to diverse learning styles and goals.
              </p>
              <p>
                At Verbofly, we foster a global community where learners can
                practice with native speakers, gaining real-world experience and
                cultural insights. Our flexible platform fits your lifestyle,
                offering tools for quick practice or in-depth study.
              </p>
            </div>
            <div className="mt-8 md:mt-0">
              <Image
                src="/asset/aboutus.png"
                alt="About Verbofly"
                width={600}
                height={400}
                layout="responsive"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-800 rounded-lg my-16 p-8">
          <blockquote className="text-2xl italic border-l-4 pl-4 border-gray-500">
          &quot;Our work makes sense only if it is a faithful witness of its time.&quot;
            <span className="block text-right font-bold mt-4">
              — Neethu S A&ldquo; Developer
            </span>
          </blockquote>
        </section>

       

        <section className="py-16 bg-transparent rounded-lg my-16 p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold mb-2">600+</p>
              <p>Sustainable works</p>
            </div>
            <div>
              <p className="text-3xl font-bold mb-2">700L</p>
              <p>Saved annually</p>
            </div>
            <div>
              <p className="text-3xl font-bold mb-2">1.2 MW</p>
              <p>LEED energy</p>
            </div>
            <div>
              <p className="text-3xl font-bold mb-2">110</p>
              <p>LUX certifications</p>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Image
                src="/asset/verboflylogo.png"
                alt="Verbofly"
                width={120}
                height={30}
              />
            </div>
            <div className="flex space-x-6">
              <a href="https://instagram.com" className="hover:text-gray-300">
                Instagram
              </a>
              <a href="https://facebook.com" className="hover:text-gray-300">
                Facebook
              </a>
              <a href="https://twitter.com" className="hover:text-gray-300">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
