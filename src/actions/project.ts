"use server"

import { AArrowDown } from "lucide-react"
import { onAuthenticateUser } from "./user"
import { client } from "@/lib/prisma"

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