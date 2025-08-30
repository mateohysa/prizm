'use client'
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { containerVariants } from '@/lib/constants'
import ProjectCard from '../project-card'
import ProjectCardSkeleton from '../project-card/skeleton'
import LoadMoreButton from '../load-more-button'
import { toast } from 'sonner'
import { DeletedProjectListItem, PaginatedDeletedProjectsResponse } from '@/lib/types/project'

type Props = {
  initialProjects?: DeletedProjectListItem[]
  initialHasMore?: boolean
  onProjectsChange?: (projects: DeletedProjectListItem[]) => void // Callback for parent to track projects
  clearProjects?: boolean // When true, clears all projects
}

export type PaginatedDeletedProjectsRef = {
  clearAllProjects: () => void
}

const PaginatedDeletedProjects = ({ initialProjects, initialHasMore, onProjectsChange }: Props) => {
  const [projects, setProjects] = useState<DeletedProjectListItem[]>(initialProjects || [])
  const [hasMore, setHasMore] = useState(initialHasMore ?? true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!initialProjects) // Show skeletons if no initial data
  const [page, setPage] = useState(initialProjects ? 2 : 1) // Start from page 1 if no initial data
  const [hasLoaded, setHasLoaded] = useState(false) // Track if we've already loaded

  // Notify parent component when projects change (for DeleteAllButton)
  useEffect(() => {
    if (onProjectsChange) {
      onProjectsChange(projects)
    }
  }, [projects, onProjectsChange])

  // Load initial data if not provided
  useEffect(() => {
    if (!initialProjects) {
      loadInitialData()
    }
  }, [])

  const loadInitialData = async () => {
    setInitialLoading(true)
    try {
      const response = await fetch('/api/projects/deleted?page=1&limit=8')
      
      if (response.ok) {
        const result = await response.json()
        setProjects(result.projects || [])
        setHasMore(result.hasMore || false)
        setPage(2) // Next page will be 2
        setInitialLoading(false)
      } else if (response.status === 404) {
        // No deleted projects found
        setProjects([])
        setHasMore(false)
        setInitialLoading(false)
      } else {
        const errorData = await response.json()
        toast.error('Error loading deleted projects', {
          description: errorData.error || 'Failed to load deleted projects'
        })
        setInitialLoading(false)
      }
    } catch (error) {
      console.error('Error loading initial deleted projects:', error)
      toast.error('Error loading deleted projects', {
        description: 'Something went wrong while loading deleted projects'
      })
      setInitialLoading(false)
    }
  }

  const loadMore = async () => {
    if (loading) return
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/projects/deleted?page=${page}&limit=8`)
      
      if (response.ok) {
        const result = await response.json()
        setProjects(prev => [...prev, ...result.projects])
        setHasMore(result.hasMore)
        setPage(prev => prev + 1)
      } else if (response.status === 404) {
        // No more deleted projects
        setHasMore(false)
      } else {
        const errorData = await response.json()
        toast.error('Error loading deleted projects', {
          description: errorData.error || 'Failed to load more deleted projects'
        })
      }
    } catch (error) {
      console.error('Error loading more deleted projects:', error)
      toast.error('Error loading deleted projects', {
        description: 'Something went wrong while loading more deleted projects'
      })
    } finally {
      setLoading(false)
    }
  }

  const renderSkeletons = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <ProjectCardSkeleton key={`skeleton-${index}`} />
    ))
  }

  // Optimistic UI handlers
  const handleOptimisticRecover = async (projectId: string) => {
    // Optimistically remove project from trash view (it's recovered)
    const originalProjects = projects
    setProjects(prev => prev.filter(p => p.id !== projectId))

    try {
      const res = await fetch('/api/projects/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      })

      if (!res.ok) {
        throw new Error('Failed to recover project')
      }

      toast.success('Success!', { description: 'Project recovered.' })
    } catch (error) {
      // Rollback on failure
      setProjects(originalProjects)
      toast.error('Error!', { description: 'Failed to recover project.' })
    }
  }

  const handleOptimisticDelete = async (projectId: string) => {
    // For permanent delete, optimistically remove from trash view
    const originalProjects = projects
    setProjects(prev => prev.filter(p => p.id !== projectId))

    try {
      const res = await fetch('/api/projects/delete-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIds: [projectId] })
      })

      if (!res.ok) {
        throw new Error('Failed to delete project permanently')
      }

      toast.success('Success!', { description: 'Project deleted permanently.' })
    } catch (error) {
      // Rollback on failure
      setProjects(originalProjects)
      toast.error('Error!', { description: 'Failed to delete project permanently.' })
    }
  }

  // Function to clear all projects (for DeleteAllButton)
  const clearAllProjects = () => {
    setProjects([])
    setHasMore(false)
  }

  return (
    <div className="w-full">
      <motion.div 
        className='grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 gap-4'
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Show initial skeleton loaders */}
        {initialLoading && renderSkeletons(8)}
        
        {/* Render actual deleted projects */}
        {!initialLoading && projects.map((project) => {
          return (
            <ProjectCard 
              key={project.id} 
              projectId={project.id}
              title={project.title}
              createdAt={project.createdAt}
              isDeleted={project.isDeleted}
              slideData={null} // We're not loading slides for list view (performance optimization)
              themeName={project.themeName || 'default'}
              onOptimisticDelete={handleOptimisticDelete}
              onOptimisticRecover={handleOptimisticRecover}
            />
          )
        })}
        
        {/* Render skeleton loaders while loading more */}
        {!initialLoading && loading && renderSkeletons(8)}
      </motion.div>
      
      {/* Load More Button */}
      {!initialLoading && (
        <LoadMoreButton 
          loading={loading}
          hasMore={hasMore}
          onClick={loadMore}
        />
      )}
    </div>
  )
}

// Export the clearAllProjects function for parent access
export { PaginatedDeletedProjects }
export default PaginatedDeletedProjects
