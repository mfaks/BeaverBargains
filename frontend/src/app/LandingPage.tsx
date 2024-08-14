import Link from "next/link"
import Navbar from "@/components/ui/Navbar"
import Footer from "@/components/ui/Footer"
import { Button } from "@/components/ui/button"
import BeaverIcon from "@/components/ui/BeaverIcon"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-orange-50 text-orange-500">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-orange-100">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none text-orange-700">
                    BeaverBargains - The Marketplace for Beaver Nation.
                  </h1>
                  <p className="max-w-[600px] text-orange-700 md:text-xl">
                    BeaverBargains is the premier platform for Oregon State community members to buy, sell, and trade their belongings in a safe and secure environment. Create your account to get started.
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
                </div>
              </div>
              <div className="flex justify-center">
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-orange-700">
                  Your One Stop Shop for All Your Bargain Hunting Needs
                </h2>
                <p className="max-w-[900px] text-orange-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  An online marketplace has never been this safe and easy.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-orange-700">
                        Buy, Sell, Trade
                      </h3>
                      <p className="text-orange-500">
                        List your items in seconds and browse a wide selection of products listed by members of Beaver Nation.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-orange-700">
                        Safety is Our Top Priority
                      </h3>
                      <p className="text-orange-500">
                        With only authenticated users from the Oregon State community, bad actors are prohibited from accessing the site.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-orange-700">Beaver Nation</h3>
                      <p className="text-orange-500">
                        Connect with other OSU community members, share your experiences, and build lasting relationships.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              {/* Community image placeholder */}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-orange-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-orange-700">Featured Listings</h2>
                <p className="max-w-[900px] text-orange-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Check out some of the latest items available on the marketplace. Create an accout to get started.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {/* Featured items cards will go here */}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}