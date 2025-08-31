'use client'
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { optimizedContainerVariants } from '@/lib/constants'
import ProjectCard from '../project-card'
import ProjectCardSkeleton from '../project-card/skeleton'
import LoadMoreButton from '../load-more-button'
import { useInfiniteProjects, useDeleteProject } from '@/hooks/use-projects'
import { ProjectListItem } from '@/lib/types/project'

const PaginatedProjects = () => {
  // Use React Query's infinite query hook for pagination
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteProjects(8)

  // Use the delete mutation hook
  const deleteProject = useDeleteProject()

  // Flatten all pages into a single array of projects
  const projects = useMemo(
    () => data?.pages.flatMap(page => page.projects) ?? [],
    [data]
  )

  const renderSkeletons = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <ProjectCardSkeleton key={`skeleton-${index}`} />
    ))
  }

  // Optimistic delete handler using React Query mutation
  const handleOptimisticDelete = async (projectId: string) => {
    deleteProject.mutate(projectId)
  }

  // Handle error states
  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading projects</p>
        <p className="text-sm text-muted-foreground">{error?.message}</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <motion.div 
        className='grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 gap-4'
        variants={optimizedContainerVariants}
        initial="hidden"
        animate="visible"
        viewport={{ once: true, amount: 0.1 }} // Only animate once when 10% is visible
      >
        {/* Show initial skeleton loaders */}
        {isLoading && renderSkeletons(8)}
        
        {/* Render actual projects */}
        {!isLoading && projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            projectId={project.id}
            title={project.title}
            createdAt={project.createdAt}
            isDeleted={false}
            slideData={null}
            themeName={project.themeName || 'default'}
            onOptimisticDelete={handleOptimisticDelete}
            onOptimisticRecover={() => {}} // Not needed in dashboard view
          />
        ))}
        
        {/* Render skeleton loaders while loading more */}
        {!isLoading && isFetchingNextPage && renderSkeletons(8)}
      </motion.div>
      
      {/* Load More Button with React Query state */}
      {!isLoading && (
        <LoadMoreButton 
          loading={isFetchingNextPage}
          hasMore={hasNextPage ?? false}
          onClick={() => fetchNextPage()}
        />
      )}
    </div>
  )
}

export default PaginatedProjects
