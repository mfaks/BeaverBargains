"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../components/auth/AuthContext";
import { FaHome } from "react-icons/fa";
import BeaverIcon from "@/components/ui/BeaverIcon";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/types/LoginForm";
import { useToast } from "@/components/ui/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string(),
});

export default function Login() {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginSuccessful, setIsLoginSuccessful] = useState(false);
  const [userFirstName, setUserFirstName] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginForm> = async (values) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/users/login`,
        values,
      );
      if (response.data && response.data.token) {
        if (!response.data.emailVerified) {
          toast({
            title: "Account Not Verified",
            description:
              "Please check your email (including spam folder) to verify your account. If you're experiencing issues, please contact our support team.",
            variant: "destructive",
            duration: 6000,
          });
          return;
        }
        const token = response.data.token;
        localStorage.setItem("token", token);
        login(
          {
            id: response.data.id,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: values.email,
            bio: response.data.bio,
            profileImageUrl: response.data.profileImageUrl,
            emailVerified: response.data.emailVerified,
          },
          token,
        );
        setUserFirstName(response.data.firstName);
        setIsLoginSuccessful(true);
        setTimeout(() => {
          setIsLoginSuccessful(false);
          router.push("/marketplace");
        }, 2000);
      } else {
        setLoginError("Unexpected response from server");
      }
    } catch (error) {
      console.error("There was a problem with the login request:", error);
      setLoginError("Invalid email or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50 p-4">
      <Card className="w-full max-w-lg border-2 border-orange-400 animate-slide-in">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <BeaverIcon className="w-12 h-12" />
            <CardTitle className="text-3xl font-bold text-center text-orange-500">
              Welcome Back
            </CardTitle>
            <BeaverIcon className="w-12 h-12" />
          </div>
          <CardDescription className="text-center text-lg">
            Enter your email and password to access your account and continue
            bargain hunting.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {loginError && (
                <div className="text-red-500 text-base mb-4">{loginError}</div>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="abc@example.com"
                        {...field}
                        className="w-full text-lg p-3"
                      />
                    </FormControl>
                    <FormMessage className="text-base" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder=""
                        {...field}
                        className="w-full text-lg p-3"
                      />
                    </FormControl>
                    <FormMessage className="text-base" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-orange-400 text-white hover:bg-orange-500 focus:bg-orange-500 text-lg py-3"
              >
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
        <Separator className="my-6" />
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-base text-gray-600">
            Don&apos;t have an account yet?
            <Link
              href="/register"
              className="text-orange-400 underline ml-2 hover:underline"
            >
              Create Account
            </Link>
          </p>
          <Button className="w-full bg-gray-100 text-orange-400 hover:bg-gray-200 text-lg py-3">
            <Link
              href="/"
              className="flex items-center justify-center space-x-2 w-full"
            >
              <FaHome className="text-xl" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
      <Dialog open={isLoginSuccessful} onOpenChange={setIsLoginSuccessful}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Login Successful</DialogTitle>
            <DialogDescription className="text-lg">
              Welcome, {userFirstName}! Redirecting you to the Marketplace.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
