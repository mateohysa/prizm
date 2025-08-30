"use server"
import { client } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { cache } from "react"

/**
 * Authenticate and manage user authentication state
 * 1. Get current user session from Clerk authentication service
 * 2. Return 403 if no authenticated user found
 * 3. Check if user exists in local database by Clerk ID
 * 4. Include user's purchased projects data for authorization checks
 * 5. Return existing user data if found (status 200)
 * 6. Create new user record if not exists:
 *    - Extract user data from Clerk (ID, email, name, profile image)
 *    - Create user record in local database
 *    - Return newly created user (status 201)
 * 7. Handle database errors and return appropriate status codes
 * 8. Return 400 for unexpected creation failures, 500 for system errors
 */
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
