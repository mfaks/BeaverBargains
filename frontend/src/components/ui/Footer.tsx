"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FaGithub } from 'react-icons/fa'

export default function Footer() {
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
    const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false)

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    return (
        <div>
            <footer className='bg-black text-white py-4'>
                <div className='container mx-auto px-4 flex flex-col items-center'>
                    <div className='flex items-center justify-between w-full'>
                        <p className='text-xs'>&copy; 2024 BeaverBargains</p>
                        <button
                            onClick={scrollToTop}
                            className='text-orange-500 text-sm hover:underline transition-all duration-200'
                            aria-label="Scroll to top"
                        >
                            Back to Top
                        </button>
                        <nav className='flex items-center space-x-4'>
                            <span
                                className='text-xs hover:underline underline-offset-4 text-orange-500 cursor-pointer'
                                onClick={() => setIsFaqDialogOpen(true)}>
                                FAQs
                            </span>
                            <span
                                className='text-xs hover:underline underline-offset-4 text-orange-500 cursor-pointer'
                                onClick={() => setIsContactDialogOpen(true)}>
                                Contact Us
                            </span>
                            <a href='https://github.com/mfaks/BeaverBargains' target='_blank' rel='noopener noreferrer' className='text-orange-500 text-xl'>
                                <FaGithub />
                            </a>
                        </nav>
                    </div>
                </div>
            </footer>
            <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Frequently Asked Questions</DialogTitle>
                        <DialogDescription>
                            List FAQs here
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Contact Us</DialogTitle>
                        <DialogDescription>
                            For any questions about payments, data security, or any other concerns, please feel free to contact the developer team at faksm@oregonstate.edu
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <a href='mailto:beaver.bargains@gmail.com' className='inline-flex items-center justify-center rounded-md border border-transparent bg-orange-400 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
                            Draft Email
                        </a>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}