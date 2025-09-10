'use client'
import React from 'react'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SaveStatus } from '@/app/(protected)/presentation/[presentationId]/_components/editor/Editor'

interface SaveIndicatorProps {
  status: SaveStatus
  className?: string
}

const SaveIndicator: React.FC<SaveIndicatorProps> = ({ status, className }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Saving...',
          textColor: 'text-white',
        }
      case 'saved':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Saved',
          textColor: 'text-white',
        }
      case 'failed':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Save failed',
          textColor: 'text-white',
        }
      case 'idle':
      default:
        return null
    }
  }

  const statusInfo = getStatusInfo()

  if (!statusInfo) {
    return null
  }

  return (
    <div className={cn(
      'flex items-center gap-1.5 text-sm font-medium transition-all duration-200',
      statusInfo.textColor,
      className
    )}>
      {statusInfo.icon}
      <span className="hidden sm:inline whitespace-nowrap">{statusInfo.text}</span>
    </div>
  )
}

export default SaveIndicator
