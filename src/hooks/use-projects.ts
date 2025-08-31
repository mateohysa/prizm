import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ProjectListItem, PaginatedProjectsResponse } from '@/lib/types/project'

// Fetch function for paginated projects
async function fetchProjects(page: number, limit: number = 8): Promise<PaginatedProjectsResponse> {
  const response = await fetch(`/api/projects/paginated?page=${page}&limit=${limit}`)
  
  if (!response.ok) {
    if (response.status === 404) {
      return { projects: [], hasMore: false, page: page, totalFetched: 0 }
    }
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch projects')
  }
  
  return response.json()
}

// Hook for infinite scrolling projects (like your current pagination)
export function useInfiniteProjects(limit: number = 8) {
  return useInfiniteQuery({
    queryKey: ['projects', 'infinite', limit],
    queryFn: ({ pageParam = 1 }) => fetchProjects(pageParam, limit),
    getNextPageParam: (lastPage, allPages) => {
      // Return the next page number if there are more pages, otherwise undefined
      if (lastPage.hasMore) {
        return allPages.length + 1
      }
      return undefined
    },
    initialPageParam: 1,
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Refetch when window regains focus
    refetchOnWindowFocus: true,
  })
}

// Hook for deleting a project with optimistic updates
export function useDeleteProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch('/api/projects/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      })
      
      if (!res.ok) {
        throw new Error('Failed to delete project')
      }
      
      return res.json()
    },
    onMutate: async (projectId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] })
      
      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({ queryKey: ['projects'] })
      
      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: ['projects'] },
        (old: any) => {
          if (!old) return old
          
          // Handle infinite query data structure
          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page: PaginatedProjectsResponse) => ({
                ...page,
                projects: page.projects.filter((p: ProjectListItem) => p.id !== projectId)
              }))
            }
          }
          
          // Handle regular query data
          if (Array.isArray(old)) {
            return old.filter((p: ProjectListItem) => p.id !== projectId)
          }
          
          return old
        }
      )
      
      // Return a context object with the snapshotted value
      return { previousData }
    },
    onError: (err, projectId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error('Error!', { description: 'Failed to delete project.' })
    },
    onSuccess: () => {
      toast.success('Success!', { description: 'Project deleted.' })
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

// Hook for recovering a project
export function useRecoverProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch('/api/projects/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      })
      
      if (!res.ok) {
        throw new Error('Failed to recover project')
      }
      
      return res.json()
    },
    onSuccess: () => {
      toast.success('Success!', { description: 'Project recovered.' })
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', 'deleted'] })
    },
    onError: () => {
      toast.error('Error!', { description: 'Failed to recover project.' })
    },
  })
}

// Hook for fetching deleted projects (for trash page)
export function useDeletedProjects(page: number = 1, limit: number = 8) {
  return useQuery({
    queryKey: ['projects', 'deleted', page, limit],
    queryFn: async () => {
      const response = await fetch(`/api/projects/deleted?page=${page}&limit=${limit}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          return { projects: [], hasMore: false, page: page, totalFetched: 0 }
        }
        throw new Error('Failed to fetch deleted projects')
      }
      
      return response.json() as Promise<PaginatedProjectsResponse>
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to prefetch next page (for better UX)
export function usePrefetchNextPage(currentPage: number, hasMore: boolean, limit: number = 8) {
  const queryClient = useQueryClient()
  
  if (hasMore) {
    queryClient.prefetchQuery({
      queryKey: ['projects', 'page', currentPage + 1, limit],
      queryFn: () => fetchProjects(currentPage + 1, limit),
      staleTime: 5 * 60 * 1000,
    })
  }
}
