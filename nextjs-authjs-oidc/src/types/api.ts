// ==============================
// API Types for Authio Admin
// ==============================

// --- Token ---
export interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
  'not-before-policy': number
  scope: string
}

// --- Users ---
export interface User {
  id: string
  userName: string
  email: string
  phoneNumber: string
  clientId: string
  firstName: string
  lastName: string
  created: string
  updated: string
  status: string
  system: boolean
  subscriptions: unknown[]
  userRoles: UserRole[]
  userTokens: UserToken[]
  sessions: unknown[]
}

export interface UserRole {
  userId: string
  roleId: string
  role: Role
}

export interface Role {
  id: string
  name: string
  description: string
  created: string
  status: string
  scope: string
  ownerId: string
  isSystemRole: boolean
  roleClaims: RoleClaim[]
}

export interface RoleClaim {
  id: number
  roleId: string
  claimType: string
  claimValue: string
}

export interface UserToken {
  userId: string
  loginProvider: string
  name: string
  value: string
  created: string
  expiration: string
}

// --- Pagination ---
export interface Pagination<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  pagination: Pagination<T>
  statusCode: string
  success: boolean
}

// --- Create User ---
export interface CreateUserRequest {
  email: string
  firstName: string
  lastName: string
  password: string
  phoneNumber: string
  userName: string
  roles: string[]
}
