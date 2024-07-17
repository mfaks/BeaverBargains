import Link from "next/link";
import BeakerIcon from "@/components/ui/BeakerIcon";

const Navbar = () => {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center bg-[black] text-[white]">
      <Link href="#" className="flex items-center justify-center" prefetch={false}>
        <BeakerIcon />
        <span className="text-2xl font-bold text-orange-500">BeaverBargains</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link
          href="/buy"
          className="text-sm font-medium hover:underline underline-offset-4 text-orange-500"
          prefetch={false}
        >
          Buy
        </Link>
        <Link
          href="/sell"
          className="text-sm font-medium hover:underline underline-offset-4 text-orange-500"
          prefetch={false}
        >
          Sell
        </Link>
        <Link
          href="#" // will include about page link here; ensure authentication first
          className="text-sm font-medium hover:underline underline-offset-4 text-orange-500"
          prefetch={false}
        >
          FAQs
        </Link>
        <Link
          href="#" // will include contact page link here; ensure authentication first
          className="text-sm font-medium hover:underline underline-offset-4 text-orange-500"
          prefetch={false}
        >
          Cart
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
