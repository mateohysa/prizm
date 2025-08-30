'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { containerVariants } from '@/lib/constants'
import ProjectCard from '../project-card'
import { ProjectListItem, DeletedProjectListItem } from '@/lib/types/project'

type Props = {
    projects: (ProjectListItem | DeletedProjectListItem)[]
}

const Projects = ({projects}: Props) => {
  return (
    <motion.div className='grid grid-cols-1 sm:grid-cols-4
    lg:grid-cols-4 gap-4'
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    >
        {projects.map((project, index) => (
            <ProjectCard 
            key={project.id} 
            projectId={project.id}
            title={project.title}
            createdAt={project.createdAt} // Already a string from our types
            isDeleted={'isDeleted' in project ? project.isDeleted : false} // Handle both types
            slideData={null} // We don't load slides for list view performance
            themeName={project.themeName || 'default'}
            />
        ))}
    </motion.div>
  )
}

export default Projects