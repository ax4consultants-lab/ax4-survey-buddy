import { Suspense, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface LazyLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const DefaultSpinner = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export const LazyLoader = ({ children, fallback }: LazyLoaderProps) => {
  return (
    <Suspense fallback={fallback || <DefaultSpinner />}>
      {children}
    </Suspense>
  );
};

export default LazyLoader;