
import React from 'react'   
import PaginatedProjects from '@/components/global/projects/paginated'

const DashboardPage = async () => {
    return (
    <div className="w-full flex flex-col gap-6 relative md:p-0 p-4">
      <div className="flex flex-col-reverse 
      items-start w-full gap-6 sm:flex-row 
      sm:justify-between sm:items-center">
        <div className="flex flex-col item-start">
            <h1 className="text-2xl font-semibold dark:text-white 
            backdrop-blur-lg">
                Projects
            </h1>
        </div>
      </div>

      <PaginatedProjects />
    </div>
  )
}

export default DashboardPage
