export default function EnquiryLoading() {
  return (
    <div className="pt-20 sm:pt-[136px] lg:pt-[160px]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="h-8 w-48 bg-muted rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-72 bg-muted rounded-lg mx-auto mb-3 animate-pulse" />
        </div>
        <div className="bg-muted rounded-2xl p-6 md:p-8 space-y-5">
          <div className="h-12 bg-muted/60 rounded-xl animate-pulse" />
          <div className="h-12 bg-muted/60 rounded-xl animate-pulse" />
          <div className="h-12 bg-muted/60 rounded-xl animate-pulse" />
          <div className="h-12 bg-muted/60 rounded-xl animate-pulse" />
          <div className="h-36 bg-muted/60 rounded-xl animate-pulse" />
          <div className="h-12 bg-muted/60 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
