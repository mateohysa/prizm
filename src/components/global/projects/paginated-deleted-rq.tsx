'use client'
import React, { useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { optimizedContainerVariants } from '@/lib/constants'
import ProjectCard from '../project-card'
import ProjectCardSkeleton from '../project-card/skeleton'
import LoadMoreButton from '../load-more-button'
import { useInfiniteDeletedProjects, useRecoverProject } from '@/hooks/use-projects'
import { DeletedProjectListItem } from '@/lib/types/project'

type Props = {
  onProjectsChange?: (projects: DeletedProjectListItem[]) => void
}

const PaginatedDeletedProjectsRQ = ({ onProjectsChange }: Props) => {
  // Use React Query's infinite query hook for deleted projects
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteDeletedProjects(8)

  // Use the recover mutation hook
  const recoverProject = useRecoverProject()

  // Flatten all pages into a single array of projects
  const projects = useMemo(() => {
    return data?.pages.flatMap(page => page.projects) ?? []
  }, [data])
  
  // Notify parent component when projects change (use useEffect to avoid infinite loop)
  useEffect(() => {
    if (onProjectsChange) {
      onProjectsChange(projects as DeletedProjectListItem[])
    }
  }, [projects, onProjectsChange])

  const renderSkeletons = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <ProjectCardSkeleton key={`skeleton-${index}`} />
    ))
  }

  // Optimistic recover handler using React Query mutation
  const handleOptimisticRecover = async (projectId: string) => {
    recoverProject.mutate(projectId)
  }

  // For permanent delete, we'll handle this in the parent component
  const handleOptimisticDelete = async (projectId: string) => {
    // This will be handled by the delete-all mutation
    // For now, we can use the existing approach
    console.log('Permanent delete:', projectId)
  }

  // Handle error states
  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading deleted projects</p>
        <p className="text-sm text-muted-foreground">{error?.message}</p>
      </div>
    )
  }

  // Handle empty state
  if (!isLoading && projects.length === 0) {
    return null // Parent component will show NotFound
  }

  return (
    <div className="w-full">
      <motion.div 
        className='grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 gap-4'
        variants={optimizedContainerVariants}
        initial="hidden"
        animate="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* Show initial skeleton loaders */}
        {isLoading && renderSkeletons(8)}
        
        {/* Render actual deleted projects */}
        {!isLoading && projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            projectId={project.id}
            title={project.title}
            createdAt={project.createdAt}
            isDeleted={true} // Always true for trash
            slideData={null}
            themeName={project.themeName || 'default'}
            onOptimisticDelete={handleOptimisticDelete}
            onOptimisticRecover={handleOptimisticRecover}
          />
        ))}
        
        {/* Render skeleton loaders while loading more */}
        {!isLoading && isFetchingNextPage && renderSkeletons(8)}
      </motion.div>
      
      {/* Load More Button with React Query state */}
      {!isLoading && projects.length > 0 && (
        <LoadMoreButton 
          loading={isFetchingNextPage}
          hasMore={hasNextPage ?? false}
          onClick={() => fetchNextPage()}
        />
      )}
    </div>
  )
}

export default PaginatedDeletedProjectsRQ
