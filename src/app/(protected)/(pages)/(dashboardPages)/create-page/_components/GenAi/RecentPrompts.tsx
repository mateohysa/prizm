'use client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { containerVariants, itemVariants } from '@/lib/constants'
import { timeAgo, truncate } from '@/lib/utils'
import usePromptStore from '@/store/usePromptStore'
import { motion } from 'framer-motion'
import React, { useEffect, useCallback } from 'react'
import useCreativeAIStore from '@/store/useCreativeAIStore'
import { toast } from 'sonner'
type Props = {}

const RecentPrompts = (props: Props) => {
    const {
        prompts, 
        setPage, 
        dbPrompts, 
        dbHasMore, 
        dbLoading, 
        loadMoreFromDB, 
        initializeDBPrompts
    } = usePromptStore()
    const {addMultipleOulines, setCurrentAiPrompt} = useCreativeAIStore()

    // Initialize database prompts on component mount
    useEffect(() => {
        initializeDBPrompts()
    }, [initializeDBPrompts])

    const handleEdit = (id: string) => {
        // Search in both localStorage and database prompts
        let prompt = prompts.find((prompt) => prompt.id === id)
        if (!prompt) {
            prompt = dbPrompts.find((prompt) => prompt.id === id)
        }
        
        if (prompt) {
            setPage('creative-ai')
            addMultipleOulines(prompt.outlines)
            setCurrentAiPrompt(prompt?.title)
        } else {
            toast.error('Error', {description: 'Prompt not found'})
        }
    }

    // Combine localStorage and database prompts for display, sorted by most recent first
    const allPrompts = [...prompts, ...dbPrompts].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Scroll-based loading
    const handleScroll = useCallback(() => {
        if (dbLoading || !dbHasMore) return
        
        const scrollTop = document.documentElement.scrollTop
        const scrollHeight = document.documentElement.scrollHeight
        const clientHeight = document.documentElement.clientHeight
        
        if (scrollTop + clientHeight >= scrollHeight - 200) {
            loadMoreFromDB()
        }
    }, [dbLoading, dbHasMore, loadMoreFromDB])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])
  return (
    <motion.div variants={containerVariants} 
    className='space-y-4 !mt-50'>
        <motion.h2 variants={itemVariants}
        className='text-lg font-semibold text-center'
        >
            Your recent prompts
        </motion.h2>
        <motion.div variants={containerVariants}
        className='space-y-2 w-full lg:max-w-[65%] mx-auto'
        >
            {allPrompts.length === 0 ? (
                <motion.div variants={itemVariants} className='text-center py-8'>
                    <p className='text-muted-foreground'>No recent prompts found</p>
                </motion.div>
            ) : (
                <>
                    {allPrompts.map((prompt, index) => (
                        <motion.div variants={itemVariants}
                        key={prompt.id}
                        className='pb-3'
                        >
                            <div className='bg-white/30 dark:bg-white/10 rounded-xl p-[1px] shadow-lg shadow-black/10 border border-gray-200 dark:border-transparent'>
                                <Card 
                                className='flex flex-row p-4 items-center justify-between bg-white/40 dark:bg-white/5 backdrop-blur-md backdrop-saturate-100 backdrop-contrast-100 bg-clip-padding border-0 rounded-[11px] hover:bg-accent/50 transition-colors duration-300'>
                                <div className='max-w-[70%]'>
                                    <h3
                                    className='font-semibold text-xl line-clamp-1'
                                    title={prompt?.title}
                                    >
                                        {truncate(prompt?.title)}
                                    </h3>
                                    <p className='font-semibold text-sm text-muted-foreground'>
                                        {timeAgo(prompt?.createdAt)}
                                    </p>
                                </div>
                                <div className='flex items-center gap-4'>
                                    <span className='text-sm text-vivid'>Creative AI</span>
                                </div>
                                <Button
                                variant='default'
                                size='sm'
                                className='rounded-xl bg-primary-20 dark:hover:bg-white/20 hover:bg-gray-200 text-primary'
                                onClick={()=> handleEdit(prompt?.id)}
                                >
                                    Edit
                                </Button>
                            </Card>
                            </div>
                        </motion.div>
                    ))}
                    
                    {/* Loading indicator - only show if we're loading and there are more prompts available */}
                    {dbLoading && dbHasMore && (
                        <motion.div variants={itemVariants} className='text-center py-4'>
                            <p className='text-muted-foreground text-sm'>Loading more prompts...</p>
                        </motion.div>
                    )}
                </>
            )}
        </motion.div>
    </motion.div>
  )
}

export default RecentPrompts