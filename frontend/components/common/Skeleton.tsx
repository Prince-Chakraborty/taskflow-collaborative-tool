const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

export const WorkspaceSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="h-1.5 w-full bg-gray-200 animate-pulse" />
    <div className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  </div>
);

export const BoardSkeleton = () => (
  <div className="rounded-2xl h-32 bg-gray-200 animate-pulse" />
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-3 w-1/2 mb-3" />
    <div className="flex justify-between">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
  </div>
);

export default Skeleton;
