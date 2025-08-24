import React from 'react'
import GeneratingOverlay from '@/components/global/GeneratingOverlay'

type Props = {
    children: React.ReactNode
}

const Layout = (props: Props) => {
  return (
    <div className='h-full w-full overflow-x-hidden relative'>
      {/* Background Image */}
      <div 
        className="fixed inset-0 -z-10 opacity-30 dark:opacity-15"
        style={{
          backgroundImage: 'url(/bg-grad.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />
      {props.children}
      
      {/* Global Generating Overlay */}
      <GeneratingOverlay />
    </div>
  )
}

export default Layout