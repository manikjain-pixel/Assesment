export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
    </div>
  );
}
