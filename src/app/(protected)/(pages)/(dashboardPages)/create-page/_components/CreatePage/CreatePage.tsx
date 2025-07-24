"use client"
import { containerVariants, CreatePageCard, itemVariants } from '@/lib/constants'
import { motion } from 'framer-motion'
import React from 'react'
import RecentPrompts from '../GenAi/RecentPrompts'
import usePromptStore from '@/store/usePromptStore'

type Props = {
    onSelectOption: (option: string) => void
}

const CreatePage = ({onSelectOption}: Props) => {
    const {prompts, setPage} = usePromptStore()
    // useEffect(()=>{
    //         setPage('create')
    // },[])
    return (
    <motion.div 
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className='space-y-8'
    >
        <motion.div variants={itemVariants} className=' text-center space-y-2'>
            <h1 className='text-4xl font-bold text-primary'>
                How would you like to get started?
            </h1>
            <p className='text-secondary'>Idea to presentation in a few clicks.</p>
        </motion.div>
        <motion.div variants={containerVariants} className='grid gap-6 md:grid-cols-3'>
            {CreatePageCard.map((option)=>(
                <motion.div
                key={option.type}
                variants={itemVariants}
                whileHover={{
                    scale: 1.05,
                    rotate:1,
                    transition: {
                        duration:0.1
                    }
                }}
                onClick={() => onSelectOption(option.type)}
                className={`${
                    option.highlight
                    ? 'bg-vivid-gradient'
                    : 'bg-white/30 dark:bg-white/10'
                } rounded-xl p-[1px] transition-all duration-300 ease-in-out cursor-pointer shadow-lg shadow-black/10 border border-gray-200 dark:border-transparent`}
                >
                    <motion.div
                    className={`w-full p-4 flex flex-col items-start backdrop-blur-md backdrop-saturate-100 backdrop-contrast-100 bg-clip-padding border-0 rounded-[11px] ${option.highlight ? 'bg-white/90 dark:bg-gray-900/90' : 'bg-white/40 dark:bg-white/5'}`}
                    whileHover={{
                        transition: {
                            duration:0.1
                        }
                    }}
                    >
                        <div className='flex flex-col items-start w-full gap-y-3'>
                            <div>
                                <p
                                className='text-primary text-lg font-semibold'
                                >
                                    {option.title}
                                </p>
                                <p 
                                className={`${option.highlight ? 'text-vivid' : 'text-primary'} text-4xl font-bold`}
                                >
                                    {option.highlightedText}
                                </p>
                            </div>
                            <p className='text-secondary text-sm font-normal'>
                                {option.description}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
                ))}
        </motion.div>
        {prompts.length > 0 && <RecentPrompts />}
    </motion.div>
  )
}

export default CreatePage