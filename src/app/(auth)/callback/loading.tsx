import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Loading() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <Loader2
        className={cn(
          "size-8 animate-spin text-muted-foreground",
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  )
}