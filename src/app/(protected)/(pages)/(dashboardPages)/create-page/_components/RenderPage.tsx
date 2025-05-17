"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import usePromptStore from '@/store/usePromptStore'
import CreatePage from './CreatePage/CreatePage'
import CreateAI from './GenAi/CreativeAI'
type Props = {}

const RenderPage = (props: Props) => {
    const router = useRouter()
    const {page, setPage} = usePromptStore()
    const handleBack = () => {
      setPage('create')
    }
    const handleSelectOption = (option: string) => {
      if(option === 'template'){
        router.push('/templates')
      }else if(option === 'scratch'){
        setPage('create-scratch')
      }else if(option === 'creative-ai'){
        setPage('creative-ai')
      }
    }
    const renderStep = () => {
      switch(page){
        case 'create':
          return <CreatePage onSelectOption={handleSelectOption}/>
        case 'creative-ai':
          return <CreateAI onBack={handleBack}/>
        case 'create-scratch':
          return <></>
        default:
      }
    }
  return (
    <AnimatePresence mode='wait'>
        <motion.div key={page}
        initial={{opacity: 0, x: 20}}
        animate={{opacity:1, x:0}}
        exit={{opacity: 0, x:-20}}
        transition={{duration: 0.3}}
        >
          {renderStep()}
        </motion.div>
    </AnimatePresence>
  )
}

export default RenderPage