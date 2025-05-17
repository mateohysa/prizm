import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { containerVariants, itemVariants } from '@/lib/constants'
import useCreativeAIStore from '@/store/useCreativeAIStore'
import { motion } from 'framer-motion'
import { ChevronLeftIcon, Loader2, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import CardList from '../Common/CardList'

type Props = {
    onBack: () => void
}

const CreateAI = ({onBack}: Props) => {
    const router = useRouter()

    //states
    const [editing, setEditing] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [selectedCard, setSelectedCard] = useState<string | null>(null)
    const [noOfCards, setNoOfCards] = useState(0)
    const [editText, setEditText] = useState("")
    //stores
        const {currentAiPrompt, setCurrentAiPrompt, outlines, resetOutlines} = useCreativeAIStore()
        
    //functions
    const resetCards = () => {
        setEditing(null)
        setSelectedCard(null)
        setEditText("")

        setCurrentAiPrompt("")
        resetOutlines()
        // setNoOfCards(0)
        // setCurrentAiPrompt('')
    }
    /// WIP const generateOutline = () => {}
    const handleBack = () => {
        onBack()
    }
  return (
    <motion.div 
    className='space-y-6 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'
    variants={containerVariants}
    initial='hidden'
    animate='visible'
    >
        <Button className='mb-4'
        variant={'outline'}
        onClick={handleBack}>
            <ChevronLeftIcon className='w-4 h-4' />
            Back
        </Button>
        <motion.div variants={itemVariants} className='text-center space-y-2'>
            <h1 className='text-2xl font-bold'>
                Generate with <span className='text-vivid'>Creative AI</span>
            </h1>
            <p className='text-secondary'>
                What  would you like to create today?
            </p>
        </motion.div>
        <motion.div
        variants={itemVariants}
        className='bg-primary/10 p-4 rounded-xl'
        >
            <div
            className='flex flex-col sm:flex-row justify-between gap-3 items-center rounded-xl'
            >
                <Input placeholder='Enter a prompt and add to the cards' 
                className='text-base sm:text-xl border-0 focus-visible:ring:0 shadow-none p-0 bg-transparent flex-grow focus:outline-none' 
                required
                onChange={(e)=>setCurrentAiPrompt(e.target.value)}
                />
                <div className='flex items-center gap-3'>
                    <Select
                    value={noOfCards.toString()}
                    onValueChange={(value)=>setNoOfCards(Number(value))}
                    >
                        <SelectTrigger className='w-fit gap-2 font-semibold shadow-xl'>
                            <SelectValue placeholder='Select number of cards' />
                        </SelectTrigger>
                        <SelectContent className='w-fit'>
                            {outlines.length===0? (
                                <SelectItem 
                                value='0'
                                className='font-semibold'
                                >
                                    No cards
                                </SelectItem>
                            ) : (Array.from({length: outlines.length},(_,index)=>index+1) 
                            ).map((num)=><SelectItem
                            key={num}
                            value={num.toString()}
                            className='font-semibold'
                            >
                                {num} {num===1 ? "card" : "cards"}
                            </SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button
                    variant="destructive"
                    size='icon'
                    aria-label='Reset Cards'
                    onClick={resetCards}
                    >
                        <RotateCcw className='w-4 h-4' />
                    </Button>
                </div>

            </div>
        </motion.div>
        <div className='w-full flex justify-center items-center'>
            <Button className='font-medium text-lg flex gap-2 items-center'
            // onClick={generateOutline}
            disabled={isGenerating}
            >
                {
                    isGenerating ? (
                        <>
                        <Loader2 className='mr-2 animate-spin' />
                        Generating...
                        </>
                    ) : (
                        'Generate Outline'
                    )
                }
            </Button>
        </div>

        <CardList/>
    </motion.div>
  )
}

export default CreateAI