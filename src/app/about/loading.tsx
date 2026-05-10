export default function AboutLoading() {
  return (
    <div className="pt-20 sm:pt-[136px] lg:pt-[160px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="h-8 w-48 bg-muted rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-muted rounded-lg mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-72 bg-muted rounded-lg mx-auto animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-80 bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
