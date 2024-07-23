"use client"

import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import axios from 'axios'
import { useState } from 'react'
import Link from 'next/link'
import { FaHome } from 'react-icons/fa'

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
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type RegistrationForm = z.infer<typeof createAccountSchema>

export default function Register() {
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

    const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const onSubmit: SubmitHandler<RegistrationForm> = async (values) => {
        try {
            const response = await axios.post('http://localhost:8080/api/users/register', {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: values.password
            })
            console.log(response.data)
            setRegistrationStatus('success')
        } catch (error) {
            console.log(error)
            setRegistrationStatus('error')
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 space-y-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-orange-500">Create an Account</CardTitle>
                    <CardDescription className="text-center">
                        Enter your details to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your first name" {...field} className="w-full" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your last name" {...field} className="w-full" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Confirm your password" {...field} className="w-full" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full bg-orange-400 text-white hover:bg-orange-500 focus:bg-orange-500">
                                Create Account
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
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
        </div>
    )
}
