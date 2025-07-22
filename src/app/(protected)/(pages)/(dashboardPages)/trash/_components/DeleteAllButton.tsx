'use client'
import React, { useState } from 'react'
import { Project } from '@/generated/prisma'
import AlertDialogBox from '@/components/global/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteAllProjects } from '@/actions/project'




type Props = {
    projects: Project[]
}

const DeleteAllButton = ({projects}: Props) => {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const handleDeleteAllProjects = async () => {
        setLoading(true)
        if(projects.length === 0 || !projects) {
            setLoading(false)
            setOpen(false)
            toast.error("Error", {description:'No projects to delete'})
            return
        }
        try {
            const res = await deleteAllProjects(projects.map((project) => project.id))
            if(res.status !== 200){
                setLoading(false)
                toast.error("Error", {description: res.error})
                return
            }
            router.refresh()
            setOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Error", {description: "Unable to delete projects."})
        }

    }
  return (
    <AlertDialogBox
    description='Are you sure you want to delete all projects? This action cannot be undone.'
    className='bg-red-500 text-white dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700'
    onClick={handleDeleteAllProjects}
    loading={loading}
    // handleOpen={setOpen(!open)}
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