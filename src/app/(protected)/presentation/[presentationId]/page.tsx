"use client"
import { getProjectById } from '@/actions/project'
import { themes } from '@/lib/constants'
import { useSlideStore } from '@/store/useSlideStore'
import { Loader2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { redirect, useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { toast } from 'sonner'
import Navbar from './_components/Navbar/Navbar'
import LayoutPreview from './_components/editor-sidebar/LeftSidebar/LayoutPreview'
import Editor from './_components/editor/Editor'
import EditorSidebar from './_components/editor-sidebar/RightSidebar'

type Props = {}

const Page = (props: Props) => {
    //WIP : Create the presentation view.

    
    const {
        setSlides, 
        setProject,
        currentTheme,
        setCurrentTheme,
    } = useSlideStore()

    const params = useParams()
    const {setTheme} = useTheme()
    const [isLoading, setIsLoading] = useState(true)
    const [projectTitle, setProjectTitle] = useState<string>("")


    useEffect(() => {
        (async () => {
          try{
            const res = await getProjectById(params.presentationId as string)
            if(res.status !== 200 || !res.data){
              toast.error("Error!", {
                description: "Unable to fetch project",
              })
              redirect("/dashboard")
            }

            const findTheme = themes.find(
              (theme)=>theme.name===res.data.themeName)


            setCurrentTheme(findTheme || themes[0])
            setTheme(findTheme?.type === 'dark' ? 'dark' : 'light')
            setProject(res.data)
            setSlides(JSON.parse(JSON.stringify(res.data.slides)))
            setProjectTitle(res.data.title)
          }catch(error){
            toast.error("Error!", {
              description: "Unable to fetch project",
            })
            redirect("/dashboard")
          }finally{
            setIsLoading(false)
          }


        })()
    },[])

    if(isLoading){
      return(
        <div className='flex items-center justify-center h-screen'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      )
    }
  return (
    <DndProvider backend={HTML5Backend}>
      <Navbar 
        presentationId={params.presentationId as string}
        presentationTitle={projectTitle}
      />
      <div
      className='flex-1 flex overflow-hidden pt-16'
      style={{
        color: currentTheme.accentColor,
        fontFamily: currentTheme.fontFamily,
        backgroundColor: currentTheme.backgroundColor,
      }}
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

export default Page