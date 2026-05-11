export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`skeleton rounded-xl ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="card-depth bg-bg-secondary p-4 rounded-2xl mb-4">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="animate-fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
