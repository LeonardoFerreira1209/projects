'use server'

import {
  TokenResponse,
  PaginatedResponse,
  User,
  CreateUserRequest,
} from '@/types/api'
import { OIDC_TOKEN_ENDPOINT, GRANT_TYPE } from '@/lib/auth/constants'

// ==============================
// Authio Admin API Service
// Server-side only
// ==============================

let cachedToken: { token: string; expiresAt: number } | null = null

/**
 * Get an admin access token using client_credentials grant
 */
export async function getAdminToken(): Promise<TokenResponse> {
  const baseUrl = process.env.AUTHIO_URL
  const clientSecret = process.env.AUTHIO_SECRET

  if (!baseUrl) {
    throw new Error('AUTHIO_URL is not configured')
  }

  if (!clientSecret) {
    throw new Error('AUTHIO_SECRET is not configured')
  }

  // Return cached token if still valid (with 30s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return {
      access_token: cachedToken.token,
      expires_in: Math.floor((cachedToken.expiresAt - Date.now()) / 1000),
      token_type: 'Bearer',
      'not-before-policy': 0,
      scope: '',
    }
  }

  const tokenUrl = `${baseUrl}${OIDC_TOKEN_ENDPOINT}`

  const body = new URLSearchParams({
    grant_type: GRANT_TYPE.CLIENT_CREDENTIALS,
    client_secret: clientSecret,
  })

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to get admin token: ${response.status} - ${errorText}`)
  }

  const data: TokenResponse = await response.json()

  // Cache the token
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return data
}

/**
 * Fetch users for a specific realm and client
 */
export async function fetchUsers(
  realm: string,
  client: string,
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<User>> {
  const baseUrl = process.env.AUTHIO_URL

  if (!baseUrl) {
    throw new Error('AUTHIO_URL is not configured')
  }

  const tokenData = await getAdminToken()

  const url = `${baseUrl}/api/admin/realms/${encodeURIComponent(realm)}/clients/${encodeURIComponent(client)}/users?PageNumber=${pageNumber}&PageSize=${pageSize}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`)
  }

  return response.json()
}

/**
 * Create a new user for a specific realm and client
 */
export async function createUser(
  realm: string,
  client: string,
  userData: CreateUserRequest
): Promise<{ success: boolean; message: string; data?: unknown }> {
  const baseUrl = process.env.AUTHIO_URL

  if (!baseUrl) {
    throw new Error('AUTHIO_URL is not configured')
  }

  const tokenData = await getAdminToken()

  const url = `${baseUrl}/api/admin/realms/${encodeURIComponent(realm)}/clients/${encodeURIComponent(client)}/users`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const errorText = await response.text()
    return {
      success: false,
      message: `Failed to create user: ${response.status} - ${errorText}`,
    }
  }

  const data = await response.json()
  return { success: true, message: 'User created successfully', data }
}
