"use server"

import { AArrowDown } from "lucide-react"
import { onAuthenticateUser } from "./user"
import { client } from "@/lib/prisma"
import { OutlineCard, Slide } from "@/lib/types"
import { JsonValue } from "@prisma/client/runtime/library"

/**
 * Fetch all projects
 * 1. Authenticate user
 * 2. Query non-deleted projects sorted by updatedAt
 * 3. If none found, return 404
 * 4. Return project list
 */
export const getAllProjects = async () => {
    try{
        const checkUser = await onAuthenticateUser()
        if(checkUser.status!== 200 || !checkUser.user){
            return {status: 403, error:"User not authenticated"}
        }

        const projects = await client.project.findMany({
            where:{
                userId: checkUser.user.id,
                isDeleted: false,
            },
            orderBy:{
                updatedAt: "desc",
            },
        })

        if(projects.length === 0){
            return {status: 404, error:"No projects found"}
        }
        return {status: 200, projects}
    }catch (e){
        console.log(e)
        return {status: 500, error:"Error getting projects"}
    }
}

/**
 * Fetch recent projects
 * 1. Authenticate user
 * 2. Query top 5 non-deleted projects by updatedAt
 * 3. If none found, return 404
 * 4. Return recent projects
 */
export const getRecentProjects = async () => {
    try{
        const checkUser = await onAuthenticateUser()
        if(checkUser.status!== 200 || !checkUser.user){
            return {status: 403, error:"User not authenticated"}
        }
        const projects = await client.project.findMany({
            where:{
                userId: checkUser.user.id,
                isDeleted: false,
            },
            orderBy:{
                updatedAt: "desc",
            },
            take: 5,
        })

        if(projects.length === 0){
            return {status: 404, error:"No projects found"}
        }
        return {status: 200, data:projects}
    }catch (error){
        console.log(error)
        return {status: 500, error:"Error getting projects"}
    }
}

/**
 * Recover deleted project
 * 1. Authenticate user
 * 2. Update isDeleted flag to false
 * 3. If update fails, return error
 * 4. Return success message
 */
export const recoverProject = async (projectId: string) => {
    try {
        const checkUser = await onAuthenticateUser()
        if(checkUser.status!== 200 || !checkUser.user){
            return {status: 403, error:"User not authenticated"}
        }
        const updatedProject = await client.project.update({
            where: {
                id: projectId,
            },
            data: {
                isDeleted: false,
            }
        })
        if(!updatedProject){
            return {status: 500, error:"Failed to recover project"}
        }
        return {status: 200, message: "Project recovered successfully"}
    } catch (error) {
         console.error("❌ ERROR:", error)
         return {status: 500, error: "Error recovering project"}
    }
}

/**
 * Soft delete project
 * 1. Authenticate user
 * 2. Set isDeleted flag to true (soft delete)
 * 3. If update fails, return error
 * 4. Return success message
 */
export const deleteProject = async (projectId: string) => {
    try {
        const checkUser = await onAuthenticateUser()
        if(checkUser.status!== 200 || !checkUser.user){
            return {status: 403, error:"User not authenticated"}
        }
        const deletedProject = await client.project.update({
            where: {
                id: projectId,
            },
            data: {
                isDeleted: true,
            }
        })
        if(!deletedProject){
            return {status: 500, error:"Failed to delete project"}
        }
        return {status: 200, message: "Project deleted successfully"}
    } catch (error) {
         console.error("❌ ERROR:", error)
         return {status: 500, error: "Error deleting project"}
    }
}

/**
 * Create new project
 * 1. Validate title and outlines inputs
 * 2. Authenticate user
 * 3. Create project record with timestamps
 * 4. If creation fails, return error
 * 5. Return created project data
 */
export const createProject = async (title: string, outlines: OutlineCard[]) => {
    try{
        if(!title || outlines.length === 0 || !outlines){
            return {status: 400, error: "Title and outlines are required"}
        }
        const allOutlines = outlines.map((outline) => outline.title)
        const checkUser = await onAuthenticateUser()
        if(checkUser.status !== 200 || !checkUser.user){
            return {status: 403, error: "User not authenticated"}
        }

        const project = await client.project.create({
            data: {
                title,
                outlines: allOutlines,
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: checkUser.user.id,
                
            }
        })
        if(!project){
            return {status: 500, error: "Failed to create project"}
        }
        return {status: 200, data: project}
    }
    catch(error){
        console.error("❌ ERROR:", error)
        return {status: 500, error: "Internal server error"}
    }
}

/**
 * Fetch project details
 * 1. Authenticate user
 * 2. Query project by ID
 * 3. If not found, return 404
 * 4. Return project data
 */
export const getProjectById = async (projectId: string) => {
    try{
        const checkUser = await onAuthenticateUser()
        if(checkUser.status !== 200 || !checkUser.user){
            return {status: 403, error: "User not authenticated"}
        }
        const project = await client.project.findFirst({
            where: {
                id: projectId,
            }
        })
        if(!project){
            return {status: 404, error: "Project not found"}
        }
        return {status: 200, data: project}
    }catch(error){
        console.error("❌ ERROR:", error)
        return {status: 500, error: "Internal server error when finding project (outer)"}
    }
}
export const updateSlides = async (projectId: string, slides: JsonValue[]) => {
    try{
        if(!projectId || !slides){
            return {status: 400, error: "Project ID and slides are required"}
        }
        const updatedProject = await client.project.update({
            where: {
                id: projectId,
            },
            data: {
                slides: slides
            },
        })
        if(!updatedProject){
            return {status: 500, error: "Failed to update slides"}
        }
        return {status: 200, data:updatedProject}
    }catch(error){
        console.error("❌ ERROR:", error)
        return {status: 500, error: "Internal server error when updating slides from the editor"}
    }
}

export const updateProjectTheme = async (projectId: string, theme: string) => {
    try{
        if(!projectId || !theme){
            return {status: 400, error: "Project ID and theme are required"}
        }
        const updatedProject = await client.project.update({
            where: {
                id: projectId,
            },
            data: {
                themeName: theme,
            }
        })
        if(!updatedProject){
            return {status: 500, error: "Failed to update project theme"}
        }
        return {status: 200, data: updatedProject}
    }catch(error){
        console.error("❌ ERROR:", error)
        return {status: 500, error: "Internal server error when updating project theme"}
    }
}


export const deleteAllProjects = async (projectIds: string[]) => {
    try {
        const checkUser = await onAuthenticateUser()
        if(checkUser.status !== 200 || !checkUser.user){
            return {status: 403, error: "User not authenticated"}
        }
        if(!Array.isArray(projectIds) || projectIds.length === 0){
            return {status: 400, error: "No project IDs provided to delete"}
        }

        const userId = checkUser.user.id
        const projectsToDelete = await client.project.findMany({
            where: {
                id: {in: projectIds},
                userId: userId,
            },
        })
        if(projectsToDelete.length === 0){
            return {
                status: 400,
                error: "No projects to delete",
            }
        }

        const deletedProjects = await client.project.deleteMany({
            where: {
                id: {in: projectsToDelete.map((project) => project.id)},
            },
        })
        
        return{
            status: 200,
            message: `${deletedProjects.count} projects deleted successfully`
        }
    } catch (error) {
        console.error("❌ ERROR:", error)
        return {
            status: 500,
            error: "Internal server error when deleting all projects (outer)",
        }
    }
}

export const getDeletedProjects = async () => {
     try {
        const checkUser = await onAuthenticateUser()
        if(checkUser.status !== 200 || !checkUser.user){
            return {status: 403, error: "User not authenticated"}
        }
        const projects = await client.project.findMany({
            where: {
                userId: checkUser.user.id,
                isDeleted: true,
            },
            orderBy: {
                updatedAt: "desc",
            }
        })
        if(projects.length === 0){
            return {status: 400 , error: "No deleted projects found", data: []}
        }
        return {status: 200, data: projects}
     } catch (error) {
        console.error("❌ ERROR:", error)
        return {
            status: 500,
            error: "Internal server error when getting deleted projects"
        }
     }
}