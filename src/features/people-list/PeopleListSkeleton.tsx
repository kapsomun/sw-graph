import { Skeleton } from '@/shared/ui/Skeleton';

// Renders a grid of placeholder cards while people data is loading
export function PeopleListSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-[rgba(0,209,255,0.08)] transition-transform hover:scale-[1.01] sw-panel"
        >
          {/* Placeholder for avatar */}
          <Skeleton width={56} height={56} rounded />

          {/* Placeholder for text lines (name + stats) */}
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={14} />
            <Skeleton width="40%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}
