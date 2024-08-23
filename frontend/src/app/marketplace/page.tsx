"use client";

import { Suspense } from "react";
import Marketplace from "./Marketplace";
import { useSearchParams } from "next/navigation";
import SkeletonLoading from "@/components/ui/SkeletonLoading";

function MarketplaceWrapper() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("search") || "";

  return <Marketplace searchQuery={searchQuery} />;
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<SkeletonLoading />}>
      <MarketplaceWrapper />
    </Suspense>
  );
}
