"use client"

import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { FaHome } from 'react-icons/fa'

const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(20, 'Password must be no more than 20 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[0-9]/, 'Password must include at least one digit')
    .regex(/[@$!%*?&#]/, 'Password must include at least one special character')

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: passwordSchema,
})

interface LoginForm {
    email: string
    password: string
}

export default function Login() {
    const form = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit: SubmitHandler<LoginForm> = async (values) => {
        try {
            const response = await axios.post('http://localhost:8080/api/login', values)
            console.log('Login successful', response.data)
            localStorage.setItem('token', response.data.token)
        } catch (error) {
            console.error('There was a problem with the login request:', error)
        }
    }


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 space-y-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-orange-500">Log In</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your email" {...field} className="w-full" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter your password" {...field} className="w-full" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full bg-orange-400 text-white hover:bg-orange-500 focus:bg-orange-500">
                                Log In
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <Card className="w-full max-w-md p-6">
                <div className="w-full max-w-md text-center space-y-2">
                    <p className="text-sm text-gray-600">
                        Already have an account?
                        <Link href="/register" className="text-orange-400 underline ml-1 hover:underline">
                            Create Account
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
        </div>
    )
}