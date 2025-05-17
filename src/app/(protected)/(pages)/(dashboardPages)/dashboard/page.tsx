
import { getAllProjects } from '@/actions/project'
import React from 'react'   
import NotFound from '@/components/global/not-found'
import Projects from '@/components/global/projects'
import ProjectCard from '@/components/global/project-card'

const DashboardPage = async () => {
    const allProjects = await getAllProjects()
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
            <p className="text-base font-normal dark:text-primary">
                All of your work in one place
            </p>
        </div>
      </div>
      {/* {Projects} */}

      
      {allProjects.projects && allProjects.projects.length > 0 ?(
        <Projects projects={allProjects.projects}/>
      ) :
     <NotFound/> 
      }
    </div>
  )
}

export default DashboardPage
