"use server"

import { client } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { onAuthenticateUser } from "./user"
import { OutlineCard } from "@/lib/types"

export interface Prompt {
  id: string
  createdAt: string
  title: string
  outlines: OutlineCard[] | []
}

/**
 * Get paginated prompts from database (excluding localStorage ones)
 * 1. Authenticate user
 * 2. Query prompts with pagination sorted by createdAt desc
 * 3. Return paginated results with hasMore flag
 */
export const getPagedPrompts = async (page: number = 1, limit: number = 5) => {
  try {
    const checkUser = await onAuthenticateUser()
    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" }
    }

    const skip = (page - 1) * limit
    
    const [prompts, totalCount] = await Promise.all([
      client.prompt.findMany({
        where: {
          userId: checkUser.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      client.prompt.count({
        where: {
          userId: checkUser.user.id,
        },
      })
    ])

    const hasMore = skip + prompts.length < totalCount

    // Transform database prompts to match localStorage format
    const transformedPrompts: Prompt[] = prompts.map(prompt => ({
      id: prompt.id,
      createdAt: prompt.createdAt.toISOString(),
      title: prompt.title,
      outlines: prompt.outlines as OutlineCard[] || []
    }))

    return {
      status: 200,
      data: {
        prompts: transformedPrompts,
        hasMore,
        totalCount,
        currentPage: page
      }
    }
  } catch (error) {
    console.error("❌ ERROR:", error)
    return { status: 500, error: "Error getting paged prompts" }
  }
}

/**
 * Save prompt to database
 * 1. Validate prompt data
 * 2. Authenticate user
 * 3. Create prompt record in database
 * 4. Return created prompt
 */
export const savePromptToDB = async (prompt: Prompt) => {
  try {
    if (!prompt.title || !prompt.outlines) {
      return { status: 400, error: "Title and outlines are required" }
    }

    const checkUser = await onAuthenticateUser()
    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" }
    }

    const createdPrompt = await client.prompt.create({
      data: {
        id: prompt.id,
        title: prompt.title,
        outlines: prompt.outlines,
        userId: checkUser.user.id,
        createdAt: new Date(prompt.createdAt),
      }
    })

    if (!createdPrompt) {
      return { status: 500, error: "Failed to save prompt to database" }
    }

    // Transform to match localStorage format
    const transformedPrompt: Prompt = {
      id: createdPrompt.id,
      createdAt: createdPrompt.createdAt.toISOString(),
      title: createdPrompt.title,
      outlines: createdPrompt.outlines as OutlineCard[] || []
    }

    return { status: 200, data: transformedPrompt }
  } catch (error) {
    console.error("❌ ERROR:", error)
    return { status: 500, error: "Error saving prompt to database" }
  }
}

/**
 * Move prompt from localStorage to database
 * 1. Validate prompt data
 * 2. Authenticate user
 * 3. Create prompt record in database
 * 4. Return success confirmation
 */
export const migratePromptToDB = async (prompt: Prompt) => {
  try {
    if (!prompt.title || !prompt.outlines || !prompt.id) {
      return { status: 400, error: "Complete prompt data required for migration" }
    }

    const checkUser = await onAuthenticateUser()
    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" }
    }

    // Check if prompt already exists in database
    const existingPrompt = await client.prompt.findUnique({
      where: { id: prompt.id }
    })

    if (existingPrompt) {
      return { status: 200, message: "Prompt already exists in database" }
    }

    const migratedPrompt = await client.prompt.create({
      data: {
        id: prompt.id,
        title: prompt.title,
        outlines: prompt.outlines,
        userId: checkUser.user.id,
        createdAt: new Date(prompt.createdAt),
      }
    })

    if (!migratedPrompt) {
      return { status: 500, error: "Failed to migrate prompt to database" }
    }

    return { status: 200, message: "Prompt migrated successfully" }
  } catch (error) {
    console.error("❌ ERROR:", error)
    return { status: 500, error: "Error migrating prompt to database" }
  }
}

/**
 * Get total count of prompts for a user
 * 1. Authenticate user
 * 2. Count total prompts in database
 * 3. Return count
 */
export const getPromptsCount = async () => {
  try {
    const checkUser = await onAuthenticateUser()
    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" }
    }

    const count = await client.prompt.count({
      where: {
        userId: checkUser.user.id,
      }
    })

    return { status: 200, data: { count } }
  } catch (error) {
    console.error("❌ ERROR:", error)
    return { status: 500, error: "Error getting prompts count" }
  }
} 