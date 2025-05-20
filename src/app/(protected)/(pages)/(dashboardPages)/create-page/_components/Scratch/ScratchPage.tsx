"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectValue, SelectTrigger, SelectItem, SelectContent } from '@/components/ui/select'
import { containerVariants } from '@/lib/constants'
import { useSlideStore } from '@/store/useSlideStore'
import useStartScratchStore from '@/store/useStartScratchStore'
import { motion, MotionConfig } from 'framer-motion'
import { ChevronLeft, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import CardList from '../Common/CardList'
import { OutlineCard } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'
import { createProject } from '@/actions/project'
type Props = {
    onBack: () => void
}

const ScratchPage = ({onBack}: Props) => {
    const router = useRouter()
    const {outlines, resetOutlines, addOutline, addMultipleOutlines} = useStartScratchStore()
    const [editText, setEditText] = useState('')
    const [editingCard, setEditingCard] = useState<string | null>(null)
    const [selectedCard, setSelectedCard] = useState<string | null>(null)
    const {project, setProject} = useSlideStore()
    const handleBack = () => {
        resetOutlines()
        onBack()
    }

    const resetCards = () => {
        setEditText('')
        resetOutlines()
    }

    const handleAddCard = () => {
        const newCard: OutlineCard = {
            id: uuidv4(),
            title: editText || 'New Section',
            order: outlines.length + 1,
        }
        setEditText('')

        addOutline(newCard)
        
    }

    const handleGenerate = async () => {
        if(outlines.length === 0){
            toast.error('Error!', {
                description: 'Please add at least one card to generate slides',
            })
            return
        }
        const res = await createProject(outlines?.[0]?.title, outlines)
        if(res.status !== 200){
            toast.success('Error!', {
                description: res.error || "Failed to create project",
            })
            return
        }
        if(res.data){
            setProject(res.data)
            resetOutlines()

            toast.success('Success!', {
                description: "Project created successfully",
            })
            router.push(`/projects/${res.data.id}/select-theme`)
        }else{
            toast.error('Error!', {
                description: "Failed to create project.",
            })
        }
    }
    
  return (
    <motion.div 
    className='space-y-6 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    >
        <Button 
        onClick={handleBack}
        variant="outline"
        className='mb-4'
        >
            <ChevronLeft className='mr-2 h-2 w-4' />
            Back
        </Button>
        <h1 className='text-2xl sm:text-3xl font-bold text-primary text-left'>
            Prompt
        </h1>

        <motion.div className='bg-primary/10 p-4 rounded-xl'
        variants={containerVariants}
        >
            <div className='flex flex-col sm:flex-row justify-between gap-3 items-center rounded-xl'>
                
                <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder='Enter your prompt and add to the cards...'
                className='text-base sm:text-xl border-0 focus-visible:ring-0 shadow-none p-0 bg-transparent flex-grow'
                />
                
                
                <div className='flex items-center gap-3'>
                <Select 
                value={outlines.length > 0 ? outlines.length.toString() : '0'}
                >

                <SelectTrigger className="w-fit gap-2 font-semibold shadow-xl">
                    <SelectValue placeholder="Select number of cards" /> 
                </SelectTrigger>
                <SelectContent className='w-fit' >
                    {outlines.length === 0 ? (
                        <SelectItem className='font-sembold' value='0'>
                            No cards
                        </SelectItem>
                    ) : (
                        Array.from({ length: outlines.length }, (_, i) => i + 1)
                            .map((num) => (
                                <SelectItem key={num} value={num.toString()} className='font-semibold'>
                                    {num} {num === 1 ? 'card' : 'cards'}
                                </SelectItem>
                            ))
                    )}
                </SelectContent>
                </Select>
                <Button
                variant="destructive"
                size="icon"
                onClick={resetCards}
                aria-label="Reset cards"
                >
                    <RotateCcw className='h-4 w-4' />
                </Button>
                </div>
            </div>
        </motion.div>
        <CardList 
        outlines={outlines}
        editingCard={editingCard}
        selectedCard={selectedCard}
        editText={editText}
        addOutline={addOutline}
        onEditChange={setEditText}
        addMultipleOutlines={addMultipleOutlines}
        onCardSelect={setSelectedCard}
        setEditText={setEditText}
        setEditingCardCard={setEditingCard}
        setSelectedCard={setSelectedCard}
        onCardDoubleClick={(id,title)=>{
            setEditingCard(id)
            setEditText(title)
        }}
        
        />
        <Button onClick={handleAddCard}
        variant={'secondary'}
        className='w-full bg-primary-10 hover:bg-primary-20'
        >
            Add Card
        </Button>
        {
            outlines.length > 0 && (
                <Button
                onClick={handleGenerate}
                className='w-full'
                >
                    Generate
                </Button>
            )
        }
    </motion.div>
  )
}

export default ScratchPage