"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    if (verified === "true") {
      setStatus("Email verified successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 3000);
    } else if (verified === "false") {
      setStatus(
        "Email verification failed. Please try again or contact support.",
      );
    }
  }, [verified, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50">
      <Card className="w-[350px]">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center text-orange-700">
            Email Verification
          </h2>
        </CardHeader>
        <CardContent>
          {status === "Verifying..." ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>{status}</span>
            </div>
          ) : verified === "true" ? (
            <Alert className="bg-green-100 border-green-500">
              <AlertTitle className="text-green-700">Success</AlertTitle>
              <AlertDescription className="text-green-600">
                {status}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-red-100 border-red-500">
              <AlertTitle className="text-red-700">Error</AlertTitle>
              <AlertDescription className="text-red-600">
                {status}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="outline"
            className="bg-orange-100 text-orange-700 hover:bg-orange-200"
            onClick={() => router.push("/login")}
          >
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
