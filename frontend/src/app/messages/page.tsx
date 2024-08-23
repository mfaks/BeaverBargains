"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import NavBar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

const DynamicMessages = dynamic(() => import("./DynamicMessages"), {
  ssr: false,
});

const Messages: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-orange-50">
      <NavBar />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center"></div>
        }
      >
        <DynamicMessages />
      </Suspense>
      <Footer />
    </div>
  );
};

export default Messages;
