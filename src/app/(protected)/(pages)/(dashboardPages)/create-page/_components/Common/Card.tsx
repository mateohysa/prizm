import { OutlineCard } from '@/lib/types'
import React from 'react'

type Props = {
    card: OutlineCard
    isEditing: boolean
    isSelected: boolean
    editText: string
    onEditChange: (value: string) => void
}

const Card = (props: Props) => {
  return (
    <div>Card</div>
  )
}

export default Card