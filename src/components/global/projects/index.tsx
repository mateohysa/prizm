'use client'
import { Project } from '@/generated/prisma'
import React from 'react'
import { motion } from 'framer-motion'
import { containerVariants } from '@/lib/constants'
import ProjectCard from '../project-card'
type Props = {
    projects: Project[]
}

const Projects = ({projects}: Props) => {
  return (
    <motion.div className='grid grid-cols-1 sm:grid-cols-2
    lg:grod-cold-4 gap-4'
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    >
        {projects.map((project, index) => (
            <ProjectCard 
            key={index} 
            projectId={project?.id}
            title={project?.title}
            createdAt={project?.createdAt.toString()}
            isDeleted={project?.isDeleted}
            slideData={project?.slides}
            themeName={project?.themeName}
            />
        ))}
    </motion.div>
  )
}

export default Projects