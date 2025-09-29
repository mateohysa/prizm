"use server"

import { AArrowDown } from "lucide-react"
import { getCachedAuthenticatedUser } from "./user"
import { client } from "@/lib/prisma"
import { OutlineCard, Slide } from "@/lib/types"
import { JsonValue } from "@prisma/client/runtime/library"
import { ProjectListItem, PaginatedProjectsResponse, DeletedProjectListItem, PaginatedDeletedProjectsResponse } from "@/lib/types/project"

/**
 * Fetch all projects
 * 1. Use provided authenticated user or authenticate
 * 2. Query non-deleted projects sorted by updatedAt
 * 3. If none found, return 404
 * 4. Return project list
 */
export const getAllProjects = async (authenticatedUser?: Awaited<ReturnType<typeof onAuthenticateUser>>) => {
    try{
        let checkUser: Awaited<ReturnType<typeof onAuthenticateUser>>
        
        if (authenticatedUser) {
            checkUser = authenticatedUser
        } else {
            checkUser = await onAuthenticateUser()
        }
        
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
 * 1. Use provided authenticated user or authenticate
 * 2. Query top 4 non-deleted projects by updatedAt (optimized for sidebar)
 * 3. If none found, return 404
 * 4. Return recent projects
 */
export const getRecentProjects = async (authenticatedUser?: Awaited<ReturnType<typeof onAuthenticateUser>>) => {
    try{
        let checkUser: Awaited<ReturnType<typeof onAuthenticateUser>>
        
        if (authenticatedUser) {
            checkUser = authenticatedUser
        } else {
            checkUser = await onAuthenticateUser()
        }
        
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
            take: 4,
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
 * Fetch projects with cursor-based pagination
 * 1. Use provided authenticated user or authenticate
 * 2. Query projects with cursor-based pagination for consistent performance
 * 3. Return projects with hasMore flag and nextCursor
 * 4. Optimized for progressive loading with skeleton states
 */
export const getProjectsPaginated = async (
    page: number = 1, 
    limit: number = 12, 
    authenticatedUser?: Awaited<ReturnType<typeof onAuthenticateUser>>
) => {
    try {
        let checkUser: Awaited<ReturnType<typeof onAuthenticateUser>>
        
        if (authenticatedUser) {
            checkUser = authenticatedUser
        } else {
            checkUser = await onAuthenticateUser()
        }
        
        if (checkUser.status !== 200 || !checkUser.user) {
            return { status: 403, error: "User not authenticated" }
        }

        const skip = (page - 1) * limit
        
        // Get projects with one extra to check if there are more
        const projects = await client.project.findMany({
            where: {
                userId: checkUser.user.id,
                isDeleted: false,
            },
            orderBy: {
                updatedAt: "desc",
            },
            skip: skip,
            take: limit + 1, // Get one extra to determine hasMore
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                themeName: true,
                // Exclude slides field to reduce data transfer
                // slides: false, // This is implicit when using select
            }
        })

        // Check if there are more projects
        const hasMore = projects.length > limit
        const projectsToReturn = hasMore ? projects.slice(0, limit) : projects

        if (projectsToReturn.length === 0 && page === 1) {
            return { status: 404, error: "No projects found", data: { projects: [], hasMore: false, page, totalFetched: 0 } }
        }

        // Serialize dates to ISO strings for the frontend
        const serializedProjects: ProjectListItem[] = projectsToReturn.map(project => ({
            id: project.id,
            title: project.title,
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
            themeName: project.themeName,
        }))

        const responseData: PaginatedProjectsResponse = {
            projects: serializedProjects,
            hasMore,
            page,
            totalFetched: serializedProjects.length
        }

        return {
            status: 200,
            data: responseData
        }
    } catch (error) {
        console.error("❌ ERROR in getProjectsPaginated:", error)
        return { status: 500, error: "Error getting paginated projects" }
    }
}

/**
 * Recover deleted project
 * 1. Use provided authenticated user or authenticate
 * 2. Update isDeleted flag to false
 * 3. If update fails, return error
 * 4. Return success message
 */
export const recoverProject = async (
    projectId: string,
    authenticatedUser?: Awaited<ReturnType<typeof onAuthenticateUser>>
) => {
    try {
        let checkUser: Awaited<ReturnType<typeof onAuthenticateUser>>
        
        if (authenticatedUser) {
            checkUser = authenticatedUser
        } else {
            checkUser = await onAuthenticateUser()
        }
        
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
 * 1. Use provided authenticated user or authenticate
 * 2. Set isDeleted flag to true (soft delete)
 * 3. If update fails, return error
 * 4. Return success message
 */
export const deleteProject = async (
    projectId: string,
    authenticatedUser?: Awaited<ReturnType<typeof onAuthenticateUser>>
) => {
    try {
        let checkUser: Awaited<ReturnType<typeof onAuthenticateUser>>
        
        if (authenticatedUser) {
            checkUser = authenticatedUser
        } else {
            checkUser = await onAuthenticateUser()
        }
        
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
        const checkUser = await getCachedAuthenticatedUser()
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
        const checkUser = await getCachedAuthenticatedUser()
        if(checkUser.status !== 200 || !checkUser.user){
            return {status: 403, error: "User not authenticated"}
        }
        const project = await client.project.findFirst({
            where: {
                id: projectId,
                userId: checkUser.user.id
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
/**
 * Update project slides
 * 1. Validate projectId and slides inputs
 * 2. Update project record with new slides data
 * 3. If update fails, return error
 * 4. Return updated project data
 */
export const updateSlides = async (projectId: string, slides: JsonValue[]) => {
    try{
        if(!projectId || !slides){
            return {status: 400, error: "Project ID and slides are required"}
        }
        
        // Authenticate user and verify ownership
        const checkUser = await getCachedAuthenticatedUser()
        if(checkUser.status !== 200 || !checkUser.user){
            return {status: 403, error: "User not authenticated"}
        }
        
        // First, verify the project exists and belongs to the user
        const project = await client.project.findFirst({
            where: {
                id: projectId,
                userId: checkUser.user.id
            }
        })
        
        if(!project){
            return {status: 404, error: "Project not found or access denied"}
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

/**
 * Update project theme
 * 1. Validate projectId and theme inputs
 * 2. Update project record with new theme name
 * 3. If update fails, return error
 * 4. Return updated project data
 */
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


/**
 * Permanently delete multiple projects (hard delete)
 * 1. Authenticate user
 * 2. Validate projectIds array input
 * 3. Find projects belonging to user for security check
 * 4. Permanently delete validated projects from database
 * 5. Return deletion count and success message
 */
export const deleteAllProjects = async (projectIds: string[]) => {
    try {
        const checkUser = await getCachedAuthenticatedUser()
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

/**
 * Fetch deleted projects with pagination (optimized version)
 * 1. Use provided authenticated user or authenticate
 * 2. Query deleted projects with pagination for consistent performance
 * 3. Return projects with hasMore flag
 * 4. Optimized for trash page with skeleton states and selective field loading
 */
export const getDeletedProjectsPaginated = async (
    page: number = 1, 
    limit: number = 8, 
    authenticatedUser?: Awaited<ReturnType<typeof onAuthenticateUser>>
) => {
    try {
        let checkUser: Awaited<ReturnType<typeof onAuthenticateUser>>
        
        if (authenticatedUser) {
            checkUser = authenticatedUser
        } else {
            checkUser = await onAuthenticateUser()
        }
        
        if (checkUser.status !== 200 || !checkUser.user) {
            return { status: 403, error: "User not authenticated" }
        }

        const skip = (page - 1) * limit
        
        // Get projects with one extra to check if there are more
        const projects = await client.project.findMany({
            where: {
                userId: checkUser.user.id,
                isDeleted: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
            skip: skip,
            take: limit + 1, // Get one extra to determine hasMore
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                themeName: true,
                isDeleted: true,
                // Exclude slides field to reduce data transfer
            }
        })

        // Check if there are more projects
        const hasMore = projects.length > limit
        const projectsToReturn = hasMore ? projects.slice(0, limit) : projects

        if (projectsToReturn.length === 0 && page === 1) {
            return { status: 404, error: "No deleted projects found", data: { projects: [], hasMore: false, page, totalFetched: 0 } }
        }

        // Serialize dates to ISO strings for the frontend
        const serializedProjects: DeletedProjectListItem[] = projectsToReturn.map(project => ({
            id: project.id,
            title: project.title,
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
            themeName: project.themeName,
            isDeleted: true, // Always true for deleted projects
        }))

        const responseData: PaginatedDeletedProjectsResponse = {
            projects: serializedProjects,
            hasMore,
            page,
            totalFetched: serializedProjects.length
        }

        return {
            status: 200,
            data: responseData
        }
    } catch (error) {
        console.error("❌ ERROR in getDeletedProjectsPaginated:", error)
        return { status: 500, error: "Error getting paginated deleted projects" }
    }
}

/**
 * Legacy function - fetch all deleted projects (kept for backward compatibility)
 * 1. Authenticate user
 * 2. Query all soft-deleted projects ordered by updatedAt
 * 3. If none found, return error with empty data
 * 4. Return all deleted projects (no pagination)
 * Note: Consider using getDeletedProjectsPaginated for better performance
 */
export const getDeletedProjects = async () => {
     try {
        const checkUser = await getCachedAuthenticatedUser()
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
