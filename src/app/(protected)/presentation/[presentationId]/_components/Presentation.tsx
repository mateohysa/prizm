"use client"
import { themes } from "@/lib/constants"
import { useSlideStore } from "@/store/useSlideStore"
import React, { useEffect, useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import Navbar from "./Navbar/Navbar"
import LayoutPreview from "./editor-sidebar/LeftSidebar/LayoutPreview"
import Editor, { SaveStatusContext, SaveStatus } from "./editor/Editor"
import EditorSidebar from "./editor-sidebar/RightSidebar"
import { Slide } from "@/lib/types"
import { Project } from "@/generated/prisma"

type Props = {
    project: Project
}

const Presentation = ({project}: Props) => {
    const {
        setSlides, 
        setProject,
        setCurrentTheme,
        setIsGenerating,
        setIsPresentationReady,
    } = useSlideStore()
    
    // Manage save status at this level so navbar can access it
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

    useEffect(() => {
        const findTheme = themes.find(
            (theme)=>theme.name===project.themeName)

        setCurrentTheme(findTheme || themes[0])
        setProject(project)
        if (project.slides && Array.isArray(project.slides)) {
            setSlides(project.slides as unknown as Slide[])
        }
    },[project, setProject, setSlides, setCurrentTheme])

    // Mark presentation as ready after component mounts and data is loaded
    useEffect(() => {
        // Small delay to ensure all child components are rendered
        const timer = setTimeout(() => {
            setIsGenerating(false)
            setIsPresentationReady(true)
        }, 100)

        return () => clearTimeout(timer)
    }, [setIsGenerating, setIsPresentationReady])

  return (
    <DndProvider backend={HTML5Backend}>
      <SaveStatusContext.Provider value={{ saveStatus, setSaveStatus }}>
        <div className="h-screen flex flex-col">
          <div className="relative z-50">
            <Navbar 
              presentationId={project.id}
              presentationTitle={project.title}
            />
          </div>
          <div className='flex-1 flex min-h-0 overflow-hidden'>
            <LayoutPreview hiddenOnMobile={true} />
            <div className='flex-1 sm:ml-64 min-h-0 overflow-auto custom-scrollbar pt-16'>
              <div className='pr-4 sm:pr-16'>
                <Editor isEditable={true} />
              </div>
            </div>
            <EditorSidebar />
          </div>
        </div>
      </SaveStatusContext.Provider>
    </DndProvider>
  )
}

export default Presentation