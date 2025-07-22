import React from 'react'
import { TriangleAlert } from 'lucide-react'

const NotFound = () => {
  return (
    <div className='flex flex-col min-h-[70vh] w-full justify-center items-center gap-12'>
        {/* <Earth /> */}
        <TriangleAlert className='text-primary' size={100} />


        <div className="flex flex-col items-center justify-center text-center">
        <p className="text-3xl font-semibold text-primary">
            Nothing to see here
        </p>

        </div>
    </div>
  )
}

export default NotFound 