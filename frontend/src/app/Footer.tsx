"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function Footer() {
    
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <>
            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full items-center px-4 md:px-6 border-t bg-[black] text-[white] fixed bottom-0 left-0 z-50">
                <p className="text-xs text-[white]">&copy; 2024 BeaverBargains.</p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <span
                        className="text-xs hover:underline underline-offset-4 text-orange-500 cursor-pointer"
                        onClick={() => setIsDialogOpen(true)}>
                        Contact Us
                    </span>
                </nav>
            </footer>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Contact Us</DialogTitle>
                        <DialogDescription>
                            For any questions about payments, data security, or any other concerns, please feel free to contact us at BeaverBargains@gmail.com.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <a href="mailto:BeaverBargains@gmail.com" className="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-400 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Send Email
                        </a>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
