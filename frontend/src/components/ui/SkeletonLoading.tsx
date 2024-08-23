import { Skeleton } from "./skeleton";

function SkeletonLoading() {
  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <Skeleton className="h-12 w-full mb-4" />
      <Skeleton className="h-8 w-3/4 mb-6" />
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}

export default SkeletonLoading;
