import { AlertTriangle, CheckCircle, HelpCircle, AlertCircle, Info } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'

type Props = {
    type: 'info' | 'warning' | 'caution' | 'success' | 'question',
    children: React.ReactNode,
    className?: string,
}

const icons = {
    success: CheckCircle,
    info: Info,
    warning: AlertTriangle,
    caution: AlertCircle,
    question: HelpCircle,
}

const CalloutBox = (
    {
        type,
        children,
        className
    }: Props) => {
        const Icon = icons[type as keyof typeof icons];

        const colors = {
            success: {
                bg: 'bg-green-100',
                text: 'text-green-700',
                border: 'border-green-500',
            },
            warning: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                border: 'border-yellow-500',
            },
            info: {
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                border: 'border-blue-500',
            },
            question: {
                bg: 'bg-purple-100',
                text: 'text-purple-700',
                border: 'border-purple-500',
            },
            caution: {
                bg: 'bg-red-100',
                text: 'text-red-700',
                border: 'border-red-500',
            }
        }
  return (

    <div className={cn('p-4 rounded-lg border-l-4 flex items-start', colors[type].bg, colors[type].text, colors[type].border, className)}>
        <Icon className='w-5 h-5 mr-3 mt-0.5' />
        <div>
            {children}
        </div>
    </div>
  )
}

export default CalloutBox