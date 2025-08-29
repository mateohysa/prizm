"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Plus } from 'lucide-react'

type Props = {
  loading: boolean
  hasMore: boolean
  onClick: () => void
  className?: string
}

const LoadMoreButton = ({ loading, hasMore, onClick, className = "" }: Props) => {
  // Don't render if there are no more items
  if (!hasMore) return null

  return (
    <div className={`w-full flex justify-center items-center py-8 ${className}`}>
      <Button
        onClick={onClick}
        disabled={loading}
        className="px-8 py-3 bg-white/60 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/15 backdrop-blur-lg backdrop-saturate-100 backdrop-contrast-100 shadow-lg shadow-black/10 text-primary transition-all duration-200 hover:scale-105 active:scale-95"
        variant="ghost"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Load More
          </>
        )}
      </Button>
    </div>
  )
}

export default LoadMoreButton
