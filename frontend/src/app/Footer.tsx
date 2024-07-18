"use client"
import Link from "next/link"

export default function Footer() {
    return (
        <>
            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full items-center px-4 md:px-6 border-t bg-[black] text-[white] fixed bottom-0 left-0 z-50">
                <p className="text-xs text-[white]">&copy; 2024 BeaverBargains.</p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link href="#"
                        className="text-xs hover:underline underline-offset-4 text-orange-500"
                        prefetch={false}>
                        Contact Us
                    </Link>
                </nav>
            </footer>
        </>
    )
}