import { Skeleton } from '@/shared/ui/Skeleton';

export function PersonDetailsSkeleton() {
  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton width={90} height={36} />
        <Skeleton width="40%" height={28} />
      </div>

      {/* Graph placeholder */}
      <section className="grid gap-2">
        <Skeleton width="25%" height={20} />
        <Skeleton width="100%" height={400}  />
      </section>

      {/* Films list skeleton */}
      <section className="grid gap-3">
        <Skeleton width="40%" height={20} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className=" rounded-md p-3 sw-panel">
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={14} />
            <Skeleton width="80%" height={12} />
          </div>
        ))}
      </section>
    </div>
  );
}
