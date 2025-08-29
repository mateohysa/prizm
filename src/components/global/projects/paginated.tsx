'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { containerVariants } from '@/lib/constants'
import ProjectCard from '../project-card'
import ProjectCardSkeleton from '../project-card/skeleton'
import LoadMoreButton from '../load-more-button'
import { toast } from 'sonner'
import { ProjectListItem, PaginatedProjectsResponse } from '@/lib/types/project'

type Props = {
  initialProjects?: ProjectListItem[]
  initialHasMore?: boolean
}

const PaginatedProjects = ({ initialProjects, initialHasMore }: Props) => {
  const [projects, setProjects] = useState<ProjectListItem[]>(initialProjects || [])
  const [hasMore, setHasMore] = useState(initialHasMore ?? true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!initialProjects) // Show skeletons if no initial data
  const [page, setPage] = useState(initialProjects ? 2 : 1) // Start from page 1 if no initial data

  // Load initial data if not provided
  useEffect(() => {
    if (!initialProjects) {
      loadInitialData()
    }
  }, [])

  const loadInitialData = async () => {
    setInitialLoading(true)
    try {
      const response = await fetch('/api/projects/paginated?page=1&limit=8')
      
      if (response.ok) {
        const result = await response.json()
        setProjects(result.projects)
        setHasMore(result.hasMore)
        setPage(2) // Next page will be 2
      } else if (response.status === 404) {
        // No projects found
        setProjects([])
        setHasMore(false)
      } else {
        const errorData = await response.json()
        toast.error('Error loading projects', {
          description: errorData.error || 'Failed to load projects'
        })
      }
    } catch (error) {
      console.error('Error loading initial projects:', error)
      toast.error('Error loading projects', {
        description: 'Something went wrong while loading projects'
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const loadMore = async () => {
    if (loading) return
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/projects/paginated?page=${page}&limit=8`)
      
      if (response.ok) {
        const result = await response.json()
        setProjects(prev => [...prev, ...result.projects])
        setHasMore(result.hasMore)
        setPage(prev => prev + 1)
      } else if (response.status === 404) {
        // No more projects
        setHasMore(false)
      } else {
        const errorData = await response.json()
        toast.error('Error loading projects', {
          description: errorData.error || 'Failed to load more projects'
        })
      }
    } catch (error) {
      console.error('Error loading more projects:', error)
      toast.error('Error loading projects', {
        description: 'Something went wrong while loading more projects'
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
  const handleOptimisticDelete = async (projectId: string) => {
    // Optimistically remove project from local state
    const originalProjects = projects
    setProjects(prev => prev.filter(p => p.id !== projectId))

    try {
      const res = await fetch('/api/projects/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      })

      if (!res.ok) {
        throw new Error('Failed to delete project')
      }

      toast.success('Success!', { description: 'Project deleted.' })
    } catch (error) {
      // Rollback on failure
      setProjects(originalProjects)
      toast.error('Error!', { description: 'Failed to delete project.' })
    }
  }

  const handleOptimisticRecover = async (projectId: string) => {
    // For recover, we don't show deleted projects in this component
    // so we don't need to handle this case here
    // This would be handled in a different component that shows deleted projects
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
      toast.error('Error!', { description: 'Failed to recover project.' })
    }
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
        
        {/* Render actual projects */}
        {!initialLoading && projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            projectId={project.id}
            title={project.title}
            createdAt={project.createdAt}
            isDeleted={false} // Paginated results only show non-deleted projects
            slideData={null} // We're not loading slides for list view (performance optimization)
            themeName={project.themeName || 'default'}
            onOptimisticDelete={handleOptimisticDelete}
            onOptimisticRecover={handleOptimisticRecover}
          />
        ))}
        
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

export default PaginatedProjects
