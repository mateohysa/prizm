'use client'
import React, { useState, useRef } from 'react'
import DeleteAllButton from './_components/DeleteAllButton'
import PaginatedDeletedProjects from '@/components/global/projects/paginated-deleted'
import NotFound from '@/components/global/not-found'
import { DeletedProjectListItem } from '@/lib/types/project'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

const Page = () => {
  const [currentProjects, setCurrentProjects] = useState<DeletedProjectListItem[]>([])
  const [showNotFound, setShowNotFound] = useState(false)
  const [componentKey, setComponentKey] = useState(0) // Force re-render when key changes

  const handleProjectsChange = (projects: DeletedProjectListItem[]) => {
    setCurrentProjects(projects)
    // Show NotFound only after initial load and if no projects
    if (projects.length === 0) {
      setShowNotFound(true)
    } else {
      setShowNotFound(false)
    }
  }

  const handleDeleteAll = async () => {
    console.log('🗑️ Delete All clicked - currentProjects:', currentProjects.length)
    
    if(currentProjects.length === 0) {
      toast.error("Error", {description:'No projects to delete'})
      return
    }
    
    try {
      // Call the actual delete API
      const res = await fetch('/api/projects/delete-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectIds: currentProjects.map((project) => project.id) 
        })
      })

      if (!res.ok) {
        throw new Error('Failed to delete all projects')
      }

      // Clear all projects from view (optimistic UI)
      setCurrentProjects([])
      setShowNotFound(true)
      
      // Force remount the PaginatedDeletedProjects component by changing its key
      console.log('🗑️ Forcing remount of PaginatedDeletedProjects')
      setComponentKey(prev => prev + 1)
      
      toast.success("Success!", { 
        description: `All projects deleted permanently.` 
      })
    } catch (error) {
      console.error(error)
      toast.error("Error", {description: "Unable to delete projects."})
    }
  }

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered')
    setShowNotFound(false)
    // Force refresh of paginated component
    window.location.reload() // Simple solution for now
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
            className='flex items-center gap-2'
          >
            <RefreshCw className='w-4 h-4' />
            Refresh
          </Button>
          <DeleteAllButton 
            projects={currentProjects} 
            onDeleteAll={handleDeleteAll}
          />
        </div>
      </div>
      
      <PaginatedDeletedProjects 
        key={componentKey}
        onProjectsChange={handleProjectsChange}
      />
      
      {showNotFound && currentProjects.length === 0 && (
        <div className="flex justify-center items-center py-8">
          <NotFound />
        </div>
      )}
    </div>
  )
}

export default Page