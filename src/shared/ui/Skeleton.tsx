
import '@/shared/styles/theme.css'; 

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  className?: string;
}

export function Skeleton({ width = '100%', height = 16, rounded, className = '' }: SkeletonProps) {
  return (
    <div
      className={`sw-skeleton ${rounded ? 'rounded-full' : 'rounded-md'} ${className}`}
      style={{ width, height }}
    />
  );
}
