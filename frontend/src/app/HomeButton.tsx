import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { FaHome } from "react-icons/fa"

export default function HomeButton() {
    return (
        <>
            <Card className="w-full max-w-md p-6">
                <div className="w-full max-w-md text-center space-y-2">
                    <p className="text-sm text-gray-600">
                        Already have an account?
                        <Link href="/login" className="text-orange-400 underline ml-1 hover:underline">
                            Log In
                        </Link>
                    </p>
                    <Button className="w-full bg-gray-100 text-orange-400 hover:bg-gray-200">
                        <Link href="/" className="flex items-center justify-center space-x-1 w-full">
                            <FaHome className="text-lg" />
                            <span className="text-sm">Back to Home</span>
                        </Link>
                    </Button>
                </div>
            </Card>
        </>
    )
}