export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-border rounded-full" />
        <div className="absolute inset-0 border-4 border-t-primary border-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}