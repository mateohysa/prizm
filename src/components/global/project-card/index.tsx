"use client"
import React, { useState } from 'react'
import { JsonValue } from '@prisma/client/runtime/library'
import { motion } from 'framer-motion'
import { optimizedItemVariants, timeAgo } from '@/lib/constants'
import { useSlideStore } from '@/store/useSlideStore'
import ProjectThumbnail from './project-thumbnail'
import { useRouter } from 'next/navigation'
import AlertDialogBox from '../alert-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { deleteProject, recoverProject } from '@/actions/project'
import { Trash2 } from 'lucide-react'
type Props = {
    projectId: string
    title: string
    createdAt: string
    themeName: string
    isDeleted: boolean
    slideData: JsonValue | null // Made optional for new thumbnail system
    onOptimisticDelete?: (projectId: string) => Promise<void>
    onOptimisticRecover?: (projectId: string) => Promise<void>
}
const ProjectCard = ({projectId, 
                    title, 
                    createdAt, 
                    themeName,
                    isDeleted, 
                    slideData,
                    onOptimisticDelete,
                    onOptimisticRecover, 
                }: Props) => {

        const [loading, setLoading] = useState(false)
        const [open, setOpen] = useState(false)
        const {setSlides} = useSlideStore()
        const router = useRouter()
        const handleNavigation = () => {
            router.push(`/presentation/${projectId}`)
        }
        
        //method for handling project recovery
        const handleRecover = async () => {
            setLoading(true)
            setOpen(false)
            
            if(!projectId){
                setLoading(false)
                toast.error('Error!', {description: 'Project not found.'})
                return
            }
            
            try {
                if (onOptimisticRecover) {
                    // Use optimistic UI if callback provided
                    await onOptimisticRecover(projectId)
                } else {
                    // Fallback to server action + refresh
                    const res = await recoverProject(projectId)
                    if(res.status !== 200){
                        toast.error('Error!', {description: 'Something went wrong.'})
                        return
                    }
                    router.refresh()
                    toast.success('Success!', {description: 'Project recovered.'})
                }
            } catch (error) {
                toast.error('Error!', {description: 'Something went wrong.'})
            } finally {
                setLoading(false)
            }
        }

        //method for handling project deletion
        const handleDelete = async () => {
            setLoading(true)
            setOpen(false)
            
            if(!projectId){
                setLoading(false)
                toast.error('Error!', {description: 'Project not found.'})
                return
            }
            
            try {
                if (onOptimisticDelete) {
                    // Use optimistic UI if callback provided
                    await onOptimisticDelete(projectId)
                } else {
                    // Fallback to server action + refresh
                    const res = await deleteProject(projectId)
                    if(res.status !== 200){
                        toast.error('Error!', {description: 'Failed to delete project.'})
                        return
                    }
                    router.refresh()
                    toast.success('Success!', {description: 'Project deleted.'})
                }
            } catch (error) {
                toast.error('Error!', {description: 'Something went wrong.'})
            } finally {
                setLoading(false)
            }
        }
  return (
    <motion.div
    variants={optimizedItemVariants}
    style={{ willChange: 'transform, opacity' }} // Optimize for animations
    whileHover={{ scale: 1.02 }} // Subtle hover effect
    transition={{ duration: 0.2 }}
    className={`group w-full flex flex-col gap-y-3 rounded-xl p-3 border bg-white/60 dark:bg-white/10 bg-clip-padding backdrop-blur-md backdrop-saturate-100 backdrop-contrast-100 shadow-lg shadow-black/10 border-gray-200 dark:border-transparent transition-colors
    ${!isDeleted && 'hover:backdrop-blur-lg hover:bg-white/70 dark:hover:bg-white/15'}
    `}
    onAnimationComplete={() => {
        // Remove will-change after animation to free memory
        if (typeof window !== 'undefined') {
            const element = document.currentScript?.parentElement;
            if (element) element.style.willChange = 'auto';
        }
    }}
    >
        <div className='relative aspect-[16/9] rounded-lg cursor-pointer overflow-hidden'
        onClick={handleNavigation}
        >
            <ProjectThumbnail 
                projectId={projectId}
                title={title}
                themeName={themeName}
            />
        </div>
        <div className='w-full'>
            <div className='space-y-1'>
                <h3 className='font-semibold text-base text-primary line-clamp-1'>
                    {title}
                </h3>
                <div className='flex w-full justify-between items-center gap-2'>
                    <p className='text-sm text-muted-foreground'
                    suppressHydrationWarning
                    >
                        {timeAgo(createdAt)} 
                    </p>
                   {isDeleted? 
                    
                    <AlertDialogBox 
                    description='This will recover your project and restore your data.'
                    className='bg-green-500 text-white dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700'
                    loading={loading}
                    open={open}
                    onClick={handleRecover}
                    handleOpen={() => setOpen(!open)}
                    >
                        <Button
                        size='sm'
                        variant='ghost'
                        className='bg-background-80 dark:hover:bg-background-90'
                        disabled={loading}
                        >
                            Recover
                        </Button>
                    </AlertDialogBox> 
                     : 
                     <AlertDialogBox 
                    description='This will delete your project and send it to the trash.'
                    className='bg-red-500 text-white dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700'
                    loading={loading}
                    open={open}
                    onClick={handleDelete}
                    handleOpen={() => setOpen(!open)}
                    >
                        <Button
                        size='sm'
                        variant='ghost'
                        className='bg-background-80 dark:hover:bg-background-300'
                        disabled={loading}
                        >
                            <Trash2 className='w-4 h-4' />
                        </Button>
                    </AlertDialogBox> 
                    }
                </div>
            </div>
        </div>
    </motion.div>
  )
}

export default ProjectCard