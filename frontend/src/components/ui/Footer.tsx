"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FaGithub } from 'react-icons/fa'
import { ChevronDownIcon } from 'lucide-react'

export default function Footer() {
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
    const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false)
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    const faqs = [
        {
            question: "What is BeaverBargains?",
            answer: "BeaverBargains is a platform for Oregon State University students to buy and sell textbooks, furniture, and other items within the campus community."
        },
        {
            question: "How do I create an account?",
            answer: "To create an account, click on the 'Join Now' button at the top of the homepage or click on the profile icon and then click on 'Create Account' in the top right corner of the homepage. You'll need to use your OSU email address to register."
        },
        {
            question: "Is it free to list items for sale?",
            answer: "Yes, listing items for sale on BeaverBargains is completely free."
        },
        {
            question: "How do I contact a seller?",
            answer: "When viewing an item listing, you'll see a 'Contact' button containing the seller's name. Click this to send a message directly to the seller through our platform."
        },
        {
            question: "Is my personal information safe?",
            answer: "We take data security seriously. Your personal information is encrypted and never shared with third parties. All app users have been verified as registered OSU community members with their ONID ID."
        },
        {
            question: "What if I have a question not listed here?",
            answer: "Feel free to contact the development team at 'beaverbargains2024@outlook.com' if you have any further questions or concerns."
        }
    ]
    
    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index)
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
                <DialogContent className="max-w-md bg-orange-50">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-orange-700">Frequently Asked Questions</DialogTitle>
                        <DialogDescription className="text-orange-500">
                            Click on a question to view its answer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-2">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border border-orange-200 rounded-lg overflow-hidden">
                                <button
                                    className="w-full text-left px-4 py-2 bg-orange-100 hover:bg-orange-200 flex justify-between items-center text-orange-700"
                                    onClick={() => toggleFaq(index)}
                                >
                                    <span className="font-semibold">{faq.question}</span>
                                    <ChevronDownIcon
                                        className={`w-5 h-5 transition-transform text-orange-500 ${openFaqIndex === index ? 'transform rotate-180' : ''
                                            }`}
                                    />
                                </button>
                                {openFaqIndex === index && (
                                    <div className="px-4 py-2 bg-white">
                                        <p className="text-sm text-orange-600">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <button
                            onClick={() => setIsFaqDialogOpen(false)}
                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-400 transition-colors"
                        >
                            Close
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                <DialogContent className="max-w-md bg-orange-50">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-orange-700">Contact Us</DialogTitle>
                        <DialogDescription className="text-orange-600">
                            For any questions or concerns, please feel free to contact our development team at beaverbargains2024@outlook.com.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <a
                            href='mailto:beaverbargains2024@outlook.com'
                            className='inline-flex items-center justify-center rounded-md border border-transparent bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-300'
                        >
                            Draft Email
                        </a>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}