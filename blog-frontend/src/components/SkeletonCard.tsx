export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
      <div className="flex gap-2 mb-3">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20" />
        <div className="skeleton h-5 w-16" />
      </div>
      <div className="skeleton h-6 w-3/4 mb-3" />
      <div className="skeleton h-4 w-full mb-1.5" />
      <div className="skeleton h-4 w-2/3 mb-4" />
      <div className="flex gap-1.5">
        <div className="skeleton h-5 w-12 rounded-md" />
        <div className="skeleton h-5 w-14 rounded-md" />
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
