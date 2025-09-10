/**
 * UI/DTO types for projects - using strings for dates to avoid serialization issues
 * Separate from Prisma types which use Date objects
 */

export type ProjectListItem = {
  id: string
  title: string
  createdAt: string // ISO string from API
  updatedAt: string // ISO string from API
  themeName: string | null
}

export type PaginatedProjectsResponse = {
  projects: ProjectListItem[]
  hasMore: boolean
  page: number
  totalFetched: number
}

/**
 * Deleted project type for trash page - extends ProjectListItem with isDeleted flag
 */
export type DeletedProjectListItem = ProjectListItem & {
  isDeleted: true // Always true for deleted projects
}

export type PaginatedDeletedProjectsResponse = {
  projects: DeletedProjectListItem[]
  hasMore: boolean
  page: number
  totalFetched: number
}
