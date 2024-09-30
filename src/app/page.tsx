import Image from "next/image";
import native from '../../public/asset/native.png';
import study from "../../public/asset/class.png";
import plan from '../../public/plan.png';
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-darkBlue from-blue-100 to-white text-white">
      <div className="container min-h-screen mx-auto px-4 py-16 flex flex-col justify-center items-center text-center">
        <div className="mb-5">
        <h1 className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text text-5xl font-bold">
          Talk Trek
        </h1>
        </div>
        
        <h1 className="text-5xl font-bold mb-4">
          Learn Any Language with Native Speakers
        </h1>
        <p className="text-lg mb-8">
          Your all-in-one platform for language learning and cultural exchange
        </p>
        <ul className="mb-8 text-lg">
          <li>✓ Study multiple languages</li>
          <li>✓ Connect with native speakers globally</li>
          <li>✓ Access lessons, quiz, and more</li>
          <li>✓ Share your learning journey as blog posts</li>
        </ul>
        <div className="flex justify-center">
          <Link href="/login">
            <button className="btn-grad text-white px-8 py-4 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105">
              Start Your Language Journey
            </button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="bg-gray-900 min-h-screen flex items-center justify-center rounded-lg mb-16">
          <div className="flex flex-col md:flex-row items-center p-8 w-full md:w-3/4">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <Image
                src={native}
                alt="People connecting online"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2 md:pl-8">
              <h2 className="text-3xl font-bold mb-4 text-white">
                Connect with Native Speakers
              </h2>
              <p className="text-xl text-gray-300">
                Find language partners, send requests, and practice with fluent
                speakers from around the globe.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 min-h-screen flex items-center justify-center rounded-lg mb-16">
          <div className="flex flex-col md:flex-row-reverse items-center p-8 w-full md:w-3/4">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <Image
                src={study}
                alt="Online language class"
                width={500}
                height={300}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2 md:pr-8">
              <h2 className="text-3xl font-bold mb-4 text-white">
                Access Predefined Video Classes
              </h2>
              <p className="text-xl text-gray-300">
                Enhance your learning with our curated video lessons taught by
                experienced language instructors.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 min-h-screen flex items-center justify-center rounded-lg">
          <div className="flex flex-col md:flex-row items-center p-8 w-full md:w-3/4">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <Image
                src={plan}
                alt="Premium features illustration"
                width={300}
                height={100}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2 md:pl-8">
              <h2 className="text-3xl font-bold mb-4 text-white">
                Upgrade Your Experience
              </h2>
              <p className="text-xl text-gray-300">
                Subscribe to unlock premium features and enjoy a seamless
                language learning journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 md:space-x-8">
            <div className="bg-gray-700 text-darkBlue p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Sign Up</h3>
              <p>Create your profile and set your language goals.</p>
            </div>
            <div className="bg-gray-700 text-darkBlue p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Connect</h3>
              <p>Find native speakers and send connection requests.</p>
            </div>
            <div className="bg-gray-700 text-darkBlue p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Learn</h3>
              <p>Take lessons and practice through conversations.</p>
            </div>
            <div className="bg-gray-700 text-darkBlue p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Improve</h3>
              <p>Track your progress and reach fluency faster.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Start Your Language Journey?
        </h2>
        <div className="flex justify-center">
          <Link href="/signup">
            <button className="joinbtn-grad text-white px-6 py-3 rounded-full text-lg joinbtn-grad:hover transition">
              Join Now
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
