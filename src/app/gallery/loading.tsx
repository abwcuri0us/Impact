export default function GalleryLoading() {
  return (
    <div className="pt-20 sm:pt-[136px] lg:pt-[160px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="h-8 w-48 bg-muted rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-80 bg-muted rounded-lg mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-muted rounded-2xl aspect-square animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
