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
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../AuthContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string(),
})

interface LoginForm {
    email: string
    password: string
}

export default function Login() {
    const router = useRouter()
    const [loginError, setLoginError] = useState<string | null>(null)
    const [isLoginSuccessful, setIsLoginSuccessful] = useState(false)
    const [userFirstName, setUserFirstName] = useState('')
    const { login } = useAuth()

    const form = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit: SubmitHandler<LoginForm> = async (values) => {
        try {
          const response = await axios.post('http://localhost:8080/api/users/login', values)
          const token = response.data.token
          login({ firstName: response.data.firstName, email: values.email }, token)
          setUserFirstName(response.data.firstName)
          setIsLoginSuccessful(true)
          setTimeout(() => {
            setIsLoginSuccessful(false)
            router.push('/marketplace')
          }, 2000)
        } catch (error) {
          console.error('There was a problem with the login request:', error)
          if (axios.isAxiosError(error) && error.response) {
            setLoginError(error.response.data || 'An error occurred during login')
          } else {
            setLoginError('An unexpected error occurred')
          }
        }
      }

    return (
        <>
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
                                {loginError && (
                                    <div className="text-red-500 text-sm mb-4">{loginError}</div>
                                )}
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
                            Don&apos;t have an account yet?
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
            <Dialog open={isLoginSuccessful} onOpenChange={setIsLoginSuccessful}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Login Successful</DialogTitle>
                        <DialogDescription>
                            Welcome, {userFirstName}! You are being redirected to the market place.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    )
}