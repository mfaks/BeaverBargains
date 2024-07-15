import Link from "next/link"
import { JSX, SVGProps } from "react"

export default function Landing() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-[#1a1a1a] text-[#f0f0f0]">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <BeakerIcon className="h-8 w-8 fill-[#d68720]" />
          <span className="text-2xl font-bold text-[#d68720]">BeaverBargains</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#" //will include buying page link here; ensure authentication first
            className="text-sm font-medium hover:underline underline-offset-4 text-[#d68720]"
            prefetch={false}
          >
            Buy
          </Link>
          <Link
            href="#" //will include selling page link here; ensure authentication first
            className="text-sm font-medium hover:underline underline-offset-4 text-[#d68720]"
            prefetch={false}
          >
            Sell
          </Link>
          <Link
            href="#" //will include about page link here; ensure authentication first
            className="text-sm font-medium hover:underline underline-offset-4 text-[#d68720]"
            prefetch={false}
          >
            About
          </Link>
          <Link
            href="#" //will include contact page link here; ensure authentication first
            className="text-sm font-medium hover:underline underline-offset-4 text-[#d68720]"
            prefetch={false}
          >
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-[#f0f0f0] text-[#1a1a1a]">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none text-[#d68720]">
                    Unlock the Power of the Beaver Community
                  </h1>
                  <p className="max-w-[600px] text-[#1a1a1a] md:text-xl">
                    BeaverBargains is the premier platform for Oregon State students to buy, sell, and trade their belongings while connecting with one another.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="#" //include link to join-now page here
                    className="inline-flex h-10 items-center justify-center rounded-md bg-[#d68720] px-8 text-sm font-medium text-[#1a1a1a] shadow transition-colors hover:bg-[#d68720]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Join Now
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src="/placeholder.svg"
                  width="400"
                  height="400"
                  alt="BeaverBargains Logo"
                  className="mx-auto aspect-square overflow-hidden rounded-xl object-contain"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[#f0f0f0] text-[#1a1a1a]">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-[#d68720]">
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
                      <h3 className="text-xl font-bold text-[#d68720]">
                        Buy, Sell, Trade
                      </h3>
                      <p className="text-[#1a1a1a]">
                        List your items in seconds and browse a wide selection of products from your fellow Beavs.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-[#d68720]">
                        Safety is Our Number 1 Priority
                      </h3>
                      <p className="text-[#1a1a1a]">
                      With only authenticated users from the Oregon State community, your payments and personal information are safe and secure.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold text-[#d68720]">Beaver Nation</h3>
                      <p className="text-[#1a1a1a]">
                        Connect with other OSU students, share your experiences, and build lasting relationships.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <img
                src="/placeholder.svg"
                width="550"
                height="310"
                alt="BeaverBargains Community"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[#f0f0f0] text-[#1a1a1a]">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-[#d68720]">Featured Listings</h2>
                <p className="max-w-[900px] text-[#1a1a1a] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Check out some of the latest and greatest items available on BeaverBargains.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div className="rounded-lg border bg-[#f0f0f0] shadow-sm">
                <img
                  src="/placeholder.svg"
                  width="300"
                  height="200"
                  alt="Product 1"
                  className="h-48 w-full rounded-t-lg object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-[#1a1a1a]">Vintage Typewriter</h3>
                  <p className="text-[#1a1a1a]">$50</p>
                  <div className="mt-2 flex gap-2">
                    <Link
                      href="#"
                      className="inline-flex h-8 items-center justify-center rounded-md bg-[#d68720] px-4 text-sm font-medium text-[#1a1a1a] shadow transition-colors hover:bg-[#d68720]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                      prefetch={false}
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-[#f0f0f0] shadow-sm">
                <img
                  src="/placeholder.svg"
                  width="300"
                  height="200"
                  alt="Product 2"
                  className="h-48 w-full rounded-t-lg object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-[#1a1a1a]">Retro Camera</h3>
                  <p className="text-[#1a1a1a]">$75</p>
                  <div className="mt-2 flex gap-2">
                    <Link
                      href="#"
                      className="inline-flex h-8 items-center justify-center rounded-md bg-[#d68720] px-4 text-sm font-medium text-[#1a1a1a] shadow transition-colors hover:bg-[#d68720]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                      prefetch={false}
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-[#f0f0f0] shadow-sm">
                <img
                  src="/placeholder.svg"
                  width="300"
                  height="200"
                  alt="Product 3"
                  className="h-48 w-full rounded-t-lg object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-[#1a1a1a]">Vintage Suitcase</h3>
                  <p className="text-[#1a1a1a]">$40</p>
                  <div className="mt-2 flex gap-2">
                    <Link
                      href="#"
                      className="inline-flex h-8 items-center justify-center rounded-md bg-[#d68720] px-4 text-sm font-medium text-[#1a1a1a] shadow transition-colors hover:bg-[#d68720]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                      prefetch={false}
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-[#f0f0f0] shadow-sm">
                <img
                  src="/placeholder.svg"
                  width="300"
                  height="200"
                  alt="Product 4"
                  className="h-48 w-full rounded-t-lg object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-[#1a1a1a]">Vintage Typewriter</h3>
                  <p className="text-[#1a1a1a]">$50</p>
                  <div className="mt-2 flex gap-2">
                    <Link
                      href="#"
                      className="inline-flex h-8 items-center justify-center rounded-md bg-[#d68720] px-4 text-sm font-medium text-[#1a1a1a] shadow transition-colors hover:bg-[#d68720]/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                      prefetch={false}
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-[#1a1a1a] text-[#f0f0f0]">
        <p className="text-xs text-[#f0f0f0]">&copy; 2024 BeaverBargains. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#"
            className="text-xs hover:underline underline-offset-4 text-[#d68720]"
            prefetch={false}>
            About
          </Link>
          <Link href="#"
            className="text-xs hover:underline underline-offset-4 text-[#d68720]"
            prefetch={false} />
        </nav>
      </footer>
    </div>
  )
}

function BeakerIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 3h15" />
      <path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" />
      <path d="M6 14h12" />
    </svg>
  )
}