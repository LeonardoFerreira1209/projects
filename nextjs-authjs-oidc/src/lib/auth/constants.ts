/**
 * OIDC and authentication constants
 * Centralized configuration for token management and OIDC endpoints
 */

/**
 * OIDC Token endpoint path
 * Appended to the issuer URL
 */
export const OIDC_TOKEN_ENDPOINT = '/protocol/openid-connect/token'

/**
 * OAuth 2.0 Grant Types
 * As defined in RFC 6749
 */
export const GRANT_TYPE = {
  REFRESH_TOKEN: 'refresh_token',
  AUTHORIZATION_CODE: 'authorization_code',
  CLIENT_CREDENTIALS: 'client_credentials',
} as const

/**
 * Authentication Error Codes
 * Standardized error codes for better error handling
 */
export const AUTH_ERROR_CODE = {
  REFRESH_TOKEN_ERROR: 'RefreshAccessTokenError',
  REFRESH_TOKEN_EXPIRED: 'RefreshTokenExpired',
  INVALID_TOKEN: 'InvalidToken',
  NETWORK_ERROR: 'NetworkError',
  SESSION_EXPIRED: 'SessionExpired',
} as const

/**
 * Token Refresh Configuration
 */
export const MAX_REFRESH_RETRY_ATTEMPTS = 3
export const REFRESH_RETRY_DELAY_MS = 1000 // 1 second base delay

/**
 * Token expiration buffer
 * Refresh token X seconds before it actually expires
 */
export const TOKEN_EXPIRATION_BUFFER_SECONDS = 60 // 1 minute before expiry
