import NavBar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

export default function Messages() {
    return (
        <div className='flex flex-col min-h-[100dvh] bg-orange-50 text-[#black]'>
            <NavBar />
            <main className='flex-1 container mx-auto px-4 md:px-6 py-12'>
                <div className='flex justify-center mb-6'>
                    <h1 className='text-3xl font-bold text-orange-500 border-b-2 border-orange-500 pb-1'>
                        My Messages
                    </h1>
                </div>
            </main>
            <Footer />
        </div>
    )
}