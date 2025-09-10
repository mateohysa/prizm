import React from 'react'
import { motion } from 'framer-motion'
import { itemVariants } from '@/lib/constants'

type Props = {}

const ProjectCardSkeleton = (props: Props) => {
  return (
    <motion.div
      variants={itemVariants}
      className="group w-full flex flex-col gap-y-3 rounded-xl p-3 border bg-white/60 dark:bg-white/10 bg-clip-padding backdrop-blur-md backdrop-saturate-100 backdrop-contrast-100 shadow-lg shadow-black/10 border-gray-200 dark:border-transparent"
    >
      {/* Thumbnail skeleton */}
      <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
        <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
      </div>
      
      {/* Content skeleton */}
      <div className="w-full space-y-1">
        {/* Title skeleton */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        
        {/* Bottom row skeleton */}
        <div className="flex w-full justify-between items-center gap-2">
          {/* Date skeleton */}
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          
          {/* Button skeleton */}
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </motion.div>
  )
}

export default ProjectCardSkeleton
