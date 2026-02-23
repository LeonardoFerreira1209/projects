'use server'

import { fetchUsers, createUser } from '@/lib/api/authio-service'
import { CreateUserRequest, PaginatedResponse, User } from '@/types/api'

// ==============================
// Server Actions for Admin Pages
// ==============================

export async function getUsersAction(
  realm: string,
  client: string,
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<{ success: boolean; data?: PaginatedResponse<User>; error?: string }> {
  try {
    const data = await fetchUsers(realm, client, pageNumber, pageSize)
    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Admin] Failed to fetch users:', message)
    return { success: false, error: message }
  }
}

export async function createUserAction(
  realm: string,
  client: string,
  userData: CreateUserRequest
): Promise<{ success: boolean; message: string; data?: unknown }> {
  try {
    const result = await createUser(realm, client, userData)
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Admin] Failed to create user:', message)
    return { success: false, message }
  }
}
