'use client'
import React, { useState } from 'react'
import DeleteAllButton from './_components/DeleteAllButton'
import PaginatedDeletedProjectsRQ from '@/components/global/projects/paginated-deleted-rq'
import NotFound from '@/components/global/not-found'
import { DeletedProjectListItem } from '@/lib/types/project'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useDeleteAllProjects } from '@/hooks/use-projects'
import { useQueryClient } from '@tanstack/react-query'

const Page = () => {
  const [currentProjects, setCurrentProjects] = useState<DeletedProjectListItem[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const queryClient = useQueryClient()
  const deleteAllMutation = useDeleteAllProjects()

  const handleProjectsChange = (projects: DeletedProjectListItem[]) => {
    setCurrentProjects(projects)
  }

  const handleDeleteAll = async () => {
    if(currentProjects.length === 0) {
      return
    }
    
    // Use the mutation with optimistic updates
    deleteAllMutation.mutate(
      currentProjects.map(project => project.id)
    )
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Invalidate and refetch deleted projects using React Query
    await queryClient.invalidateQueries({ queryKey: ['projects', 'deleted'] })
    setIsRefreshing(false)
  }

  return (
    <div className='flex flex-col gap-6 relative'>
      <div className='flex justify-between items-center'>
        <div className='flex flex-col items-start'>
          <h1 className='text-2xl font-semibold dark:text-primary backdrop-blur-bg'>Trash</h1>
        </div>
        <div className='flex gap-2 items-center'>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className='flex items-center gap-2'
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <DeleteAllButton 
            projects={currentProjects} 
            onDeleteAll={handleDeleteAll}
            disabled={deleteAllMutation.isPending}
          />
        </div>
      </div>
      
      <PaginatedDeletedProjectsRQ 
        onProjectsChange={handleProjectsChange}
      />
      
      {currentProjects.length === 0 && (
        <div className="flex justify-center items-center py-8">
          <NotFound />
        </div>
      )}
    </div>
  )
}

export default Page