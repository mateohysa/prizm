import React from 'react'
import NotFound from '@/components/global/not-found'

const Page = async () => {
    return (
    <div className='flex flex-col gap-6 relative'>
        <div className='flex justify-between items-center'>
            <div className='flex flex-col items-start'>
                <h1 className='text-2xl font-semibold dark:text-primary backdrop-blur-bg'>Templates</h1>
            </div>
        </div>
        <NotFound />
    </div>
  )
}

export default Page 