"use client";

import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import CardCarousel from "./CardCarousel";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-orange-50 text-orange-500">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-4 md:py-8 lg:py-12 xl:py-16 bg-orange-100">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none text-orange-700">
                    BeaverBargains - The Marketplace for Beaver Nation.
                  </h1>
                  <p className="max-w-[600px] text-orange-700 md:text-xl">
                    BeaverBargains is the premier platform for Oregon State
                    community members to buy, sell, and trade their belongings
                    in a safe and secure environment. Create your account to get
                    started.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/register"
                    className="inline-flex h-14 items-center justify-center rounded-md bg-orange-500 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    <Button className="bg-orange-500 text-white rounded-md px-4 py-2 ml-2 hover:bg-orange-400">
                      Join Now
                    </Button>
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-14 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-orange-500 shadow transition-colors hover:bg-orange-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    <Button className="bg-white text-orange-500 rounded-md px-4 py-2 ml-2 hover:bg-orange-200 hover:text-orange-700">
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src="/images/Weatherford.jpg"
                  alt="BeaverBargains Marketplace"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-8 md:py-16 lg:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-orange-700">
                  Your One-Stop Shop for All Your Bargain Hunting Needs
                </h2>
                <p className="text-orange-500">
                  Whether you're quickly looking to offload items when you move
                  out or hunt for deals in the Beaver community, an online
                  marketplace has never been this safe and easy.
                </p>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <div className="flex-1 pr-8">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-orange-700">
                        Buy, Sell, Trade
                      </h3>
                      <p className="text-orange-500">
                        List your items in seconds and browse a wide selection
                        of products listed by members of Beaver Nation.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-orange-700">
                        Safety is Our Top Priority
                      </h3>
                      <p className="text-orange-500">
                        With only authenticated users from the Oregon State
                        community, bad actors are prohibited from accessing the
                        site or your information.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-orange-700">
                        Beaver Nation
                      </h3>
                      <p className="text-orange-500">
                        Connect with other OSU community members, share your
                        experiences, and build lasting relationships.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-4">
                <img
                  src="/images/BeaverCommunity.jpg"
                  alt="Beaver Nation"
                  className="w-5/6 h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-4 md:py-8 lg:py-12 bg-orange-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-4">
              <div className="space-y-2">
                <Link href="/register">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-orange-700 underline cursor-pointer hover:text-orange-600 transition-colors">
                    Join BeaverBargains Today
                  </h2>
                  <p>
                    Experience the all-in-one marketplace where you can buy,
                    sell, favorite items, track your order history, and safely
                    message verified sellers.
                  </p>
                </Link>
              </div>
            </div>
            <CardCarousel />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
