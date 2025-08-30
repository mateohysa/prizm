'use client'
import React, { useState } from 'react'
import AlertDialogBox from '@/components/global/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import { toast } from 'sonner'
import { DeletedProjectListItem } from '@/lib/types/project'

type Props = {
    projects: DeletedProjectListItem[]
    onDeleteAll?: () => void // Callback to clear projects optimistically
}

const DeleteAllButton = ({projects, onDeleteAll}: Props) => {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const handleDeleteAllProjects = async () => {
        console.log('🗑️ DeleteAllButton handleDeleteAllProjects called')
        
        if(projects.length === 0 || !projects) {
            toast.error("Error", {description:'No projects to delete'})
            setOpen(false)
            return
        }
        
        setLoading(true)
        setOpen(false)
        
        // Use the parent's delete handler if provided, otherwise use internal logic
        if (onDeleteAll) {
            console.log('🗑️ Using parent onDeleteAll callback')
            try {
                await onDeleteAll()
            } catch (error) {
                console.error('Error in onDeleteAll:', error)
            } finally {
                setLoading(false)
            }
        } else {
            console.log('🗑️ Using internal delete logic')
            try {
                const res = await fetch('/api/projects/delete-all', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        projectIds: projects.map((project) => project.id) 
                    })
                })

                if (!res.ok) {
                    throw new Error('Failed to delete all projects')
                }
                
                toast.success("Success!", { 
                    description: `${projects.length} projects deleted permanently.` 
                })
            } catch (error) {
                console.error(error)
                toast.error("Error", {description: "Unable to delete projects."})
            } finally {
                setLoading(false)
            }
        }
    }
  return (
    <AlertDialogBox
    description='Are you sure you want to delete all projects? This action cannot be undone.'
    className='bg-red-500 text-white dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700'
    onClick={handleDeleteAllProjects}
    loading={loading}
    handleOpen={() => setOpen(!open)}
    open={open}
    >
        <Button className='bg-background-80 rounded-lg dark:hover:bg-background-90 text-primary font-semibold hover:text-white'>
            <Trash />
            Delete All
        </Button>
    </AlertDialogBox>
  )
}

export default DeleteAllButton