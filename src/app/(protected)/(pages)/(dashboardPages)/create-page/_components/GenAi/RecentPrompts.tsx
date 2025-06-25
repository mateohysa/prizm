'use client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { containerVariants, itemVariants } from '@/lib/constants'
import { timeAgo, truncate } from '@/lib/utils'
import usePromptStore from '@/store/usePromptStore'
import { motion } from 'framer-motion'
import React from 'react'
import useCreativeAIStore from '@/store/useCreativeAIStore'
import { toast } from 'sonner'
type Props = {}

const RecentPrompts = (props: Props) => {
    const {prompts, setPage} = usePromptStore()
    const {addMultipleOulines, setCurrentAiPrompt} = useCreativeAIStore()

    const handleEdit = (id: string) => {
        const prompt = prompts.find((prompt) => prompt.id === id)
        if (prompt) {
            setPage('creative-ai')
            addMultipleOulines(prompt.outlines)
            setCurrentAiPrompt(prompt?.title)
        }else{
            toast.error('Erorr', {description: 'Prompt not found'})
        }
    }
  return (
    <motion.div variants={containerVariants} 
    className='space-y-4 !mt-50'>
        <motion.h2 variants={itemVariants}
        className='text-lg font-semibold text-center'
        >
            Your recent prompts
        </motion.h2>
        <motion.div variants={containerVariants}
        className='space=y-2 w-full lg:max-w-[65%] mx-auto'
        >
            {prompts.map((prompt, index) => (
                <motion.div variants={itemVariants}
                key={index}
                className='pb-3'
                >
                    <Card 
                    className='flex flex-row p-4 items-center justify-between hover:bg-accent/50 transition-colors duration-300'>
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
                        className='rounded-xl bg-primary-20 dark:hover:bg-gray-700 hover:bg-gray-200 text-primary'
                        onClick={()=> handleEdit(prompt?.id)}
                        >
                            Edit
                        </Button>
                    </Card>
                </motion.div>
             ))} 
        </motion.div>
    </motion.div>
  )
}

export default RecentPrompts