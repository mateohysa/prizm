"use client"
import { themes } from "@/lib/constants"
import { useSlideStore } from "@/store/useSlideStore"
import React, { useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import Navbar from "./Navbar/Navbar"
import LayoutPreview from "./editor-sidebar/LeftSidebar/LayoutPreview"
import Editor from "./editor/Editor"
import EditorSidebar from "./editor-sidebar/RightSidebar"
import { Slide } from "@/lib/types"
import { Project } from "@prisma/client"

type Props = {
    project: Project
}

const Presentation = ({project}: Props) => {
    const {
        setSlides, 
        setProject,
        setCurrentTheme,
    } = useSlideStore()

    useEffect(() => {
        const findTheme = themes.find(
            (theme)=>theme.name===project.themeName)

        setCurrentTheme(findTheme || themes[0])
        setProject(project)
        if (project.slides && Array.isArray(project.slides)) {
            setSlides(project.slides as unknown as Slide[])
        }
    },[project, setProject, setSlides, setCurrentTheme])

  return (
    <DndProvider backend={HTML5Backend}>
      <Navbar 
        presentationId={project.id}
        presentationTitle={project.title}
      />
      <div
      className='flex-1 flex overflow-hidden pt-16'
      >
        <LayoutPreview hiddenOnMobile={true} />
        <div className='flex-1 sm:ml-64 pr-4 sm:pr-16'>
          <Editor isEditable={true} />
        </div>
        <EditorSidebar />
      </div>
    </DndProvider>
  )
}

export default Presentation