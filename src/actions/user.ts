"use server"
import { client } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { cache } from "react"

export const onAuthenticateUser = async () => {
    try{
        const user = await currentUser()
        if(!user){
            return {status: 403}
        }

        const userExists = await client.user.findUnique({
            where: {
                clerkId : user?.id!,
            },include:{
                PurchasedProjects: {
                    select:{
                        id: true,
                    },
                },
            },
        })

        if(userExists){
            return {status: 200, user: userExists}
        }

        const newUser = await client.user.create({
            data:{
            clerkId: user.id,
            email: user.emailAddresses[0].emailAddress,
            name: user.firstName + " " + user.lastName,
            profileImageUrl: user.imageUrl,
            },
        })

        if(newUser){
            return {status: 201, user: newUser}
        }
        return {status: 400}
    }catch (e){
        console.log(e)
        return {status: 500}
    }
}

// Cached version of onAuthenticateUser to prevent redundant database calls within the same request
export const getCachedAuthenticatedUser = cache(onAuthenticateUser)
