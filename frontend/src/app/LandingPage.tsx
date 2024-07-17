import Link from "next/link"
import Navbar from "./NavBar"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-[white] text-[black]">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none text-orange-500">
                    BeaverBargains - The Marketplace for Beavs.
                  </h1>
                  <p className="max-w-[600px] text-[#1a1a1a] md:text-xl">
                    BeaverBargains is the premier platform for Oregon State community members to buy, sell, and trade their belongings in a safe and secure environment.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link
                  href="#" //include link to join-now page here
                  className="inline-flex h-14 items-center justify-center rounded-md bg-orange-500 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  prefetch={false}
                  >
                    <Button className="bg-orange-500 text-white rounded-md px-4 py-2 ml-2">Join Now</Button>
                  </Link>

                </div>
              </div>
              <div className="flex justify-center">
                {/* <img
                  src="" //will include logo svg here
                  width="400"
                  height="400"
                  alt="BeaverBargains Logo" 
                  className="mx-auto aspect-square overflow-hidden rounded-xl object-contain"
                /> */}
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[#f0f0f0] text-[#1a1a1a]">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-orange-500">
                  Your One Stop Shop for All Your Beaver Needs
                </h2>
                <p className="max-w-[900px] text-[#1a1a1a] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Buying, selling, and trading has never been this safe and easy.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-orange-500">
                        Buy, Sell, Trade
                      </h3>
                      <p className="text-[#1a1a1a]">
                        List your items in seconds and browse a wide selection of products from your fellow Beavs.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-orange-500">
                        Safety is Our Number 1 Priority
                      </h3>
                      <p className="text-[#1a1a1a]">
                      With only authenticated users from the Oregon State community, bad actors are prohibited from accessing the cite. Our robust security measures will ensure your payments and personal information are safe and secure.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-orange-500">Beaver Nation</h3>
                      <p className="text-[#1a1a1a]">
                        Connect with other OSU community members, share your experiences, and build lasting relationships.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              {/* <img
                src="" //will include svg of Oregon State community here
                width="550"
                height="310"
                alt="BeaverBargains Community"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              /> */}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[#f0f0f0] text-[#1a1a1a]">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-orange-500">Featured Listings</h2>
                <p className="max-w-[900px] text-[#1a1a1a] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Check out some of the latest and greatest items available on BeaverBargains.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {/* Card component for featured items will go here */}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-[#1a1a1a] text-[#f0f0f0]">
        <p className="text-xs text-[#f0f0f0]">&copy; 2024 BeaverBargains. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#"
            className="text-xs hover:underline underline-offset-4 text-orange-500"
            prefetch={false}>
            About
          </Link>
          <Link href="#"
            className="text-xs hover:underline underline-offset-4 text-orange-500"
            prefetch={false} />
        </nav>
      </footer>
    </div>
  )
}