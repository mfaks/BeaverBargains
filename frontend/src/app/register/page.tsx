"use client"

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FaHome } from 'react-icons/fa'
import BeaverIcon from '@/components/ui/BeaverIcon'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useAuth } from '@/components/auth/AuthContext'

const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(20, 'Password must be no more than 20 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[0-9]/, 'Password must include at least one digit')
    .regex(/[@$!%*?&#]/, 'Password must include at least one special character')

const createAccountSchema = z.object({
    firstName: z.string().min(3, 'First name must be at least 3 characters'),
    lastName: z.string().min(3, 'Last name must be at least 3 characters'),
    email: z.string().email('Invalid email format').min(5, 'Email must be at least 5 characters'),
    password: passwordSchema,
    confirmPassword: passwordSchema
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

type RegistrationForm = z.infer<typeof createAccountSchema>

export default function Register() {
    const { login } = useAuth()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const { toast } = useToast()
    const router = useRouter()
    const [isRegistrationSuccessful, setIsRegistrationSuccessful] = useState(false)
    const [userFirstName, setUserFirstName] = useState('')

    const form = useForm<RegistrationForm>({
        resolver: zodResolver(createAccountSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    })

    const onSubmit: SubmitHandler<RegistrationForm> = async (values) => {
        try {
            const response = await axios.post(`http://localhost:8080/api/users/register`, {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: values.password
            })
            const { user, token } = response.data
            login(user, token)
            setUserFirstName(values.firstName)
            setIsRegistrationSuccessful(true)
            setErrorMessage(null)
            setTimeout(() => {
                setIsRegistrationSuccessful(false)
                router.push('/marketplace')
            }, 2000)
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setErrorMessage(error.response.data)
            } else {
                setErrorMessage('An unexpected error occurred')
            }
            toast({
                title: 'Error',
                description: 'Registration failed. Please try again.',
                variant: 'destructive',
            })
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-orange-50 p-4">
            <Card className="w-full max-w-md border-2 border-orange-400 animate-slide-in">
                <CardHeader className="space-y-1 pb-4">
                    <div className="flex items-center justify-center space-x-2">
                        <BeaverIcon className="w-8 h-8" />
                        <CardTitle className="text-2xl font-bold text-center text-orange-500">Create Account</CardTitle>
                        <BeaverIcon className="w-12 h-12" />
                    </div>
                    <CardDescription className="text-center text-sm">
                        Enter your details to create your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {errorMessage && (
                                <div className="text-red-500 text-sm mb-2">{errorMessage}</div>
                            )}
                            <div className="flex space-x-2">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel className="text-sm">First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="First name" {...field} className="w-full text-sm p-2" />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel className="text-sm">Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Last name" {...field} className="w-full text-sm p-2" />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="abc@example.com" {...field} className="w-full text-sm p-2" />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} className="w-full text-sm p-2" />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} className="w-full text-sm p-2" />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full bg-orange-400 text-white hover:bg-orange-500 focus:bg-orange-500 text-sm py-2">
                                Create Account
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <Separator className="my-4" />
                <CardFooter className="flex flex-col space-y-2">
                    <p className="text-sm text-gray-600">
                        Already have an account?
                        <Link href="/login" className="text-orange-400 underline ml-1 hover:underline">
                            Sign In
                        </Link>
                    </p>
                    <Button className="w-full bg-gray-100 text-orange-400 hover:bg-gray-200 text-sm py-2">
                        <Link href="/" className="flex items-center justify-center space-x-1 w-full">
                            <FaHome className="text-base" />
                            <span>Back to Home</span>
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
            <Dialog open={isRegistrationSuccessful} onOpenChange={setIsRegistrationSuccessful}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-xl">Registration Successful</DialogTitle>
                        <DialogDescription className="text-base">
                            Welcome, {userFirstName}! Redirecting you to the Marketplace.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}