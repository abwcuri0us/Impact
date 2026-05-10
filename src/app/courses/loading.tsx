export default function CoursesLoading() {
  return (
    <div className="pt-20 sm:pt-[136px] lg:pt-[160px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="h-8 w-48 bg-muted rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-muted rounded-lg mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded-lg mx-auto animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted rounded-2xl h-96 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
