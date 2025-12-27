/**
 * Token utility functions
 * Helper functions for token validation and manipulation
 */

/**
 * Token validation result interface
 */
export interface TokenValidation {
  isValid: boolean
  error?: string
}

/**
 * Validates a JWT token format (basic validation)
 * Does not verify signature - just checks structure
 *
 * @param token - The token to validate
 * @returns TokenValidation result
 */
export function validateToken(token: string): TokenValidation {
  if (!token || typeof token !== 'string') {
    return { isValid: false, error: 'Token is empty or not a string' }
  }

  // JWT tokens have 3 parts separated by dots
  const parts = token.split('.')
  if (parts.length !== 3) {
    return { isValid: false, error: 'Token does not have 3 parts' }
  }

  // Check if parts are base64url encoded
  const base64UrlPattern = /^[A-Za-z0-9_-]+$/
  for (const part of parts) {
    if (!part || !base64UrlPattern.test(part)) {
      return {
        isValid: false,
        error: 'Token parts are not valid base64url encoding',
      }
    }
  }

  return { isValid: true }
}

/**
 * Masks a token for logging purposes
 * Shows first 10 and last 10 characters
 *
 * @param token - The token to mask
 * @returns Masked token string
 */
export function maskToken(token: string): string {
  if (!token || token.length < 20) {
    return '***'
  }
  return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
}

/**
 * Checks if a token is expired or about to expire
 *
 * @param expiresAt - Expiration timestamp in milliseconds
 * @param bufferSeconds - Buffer time in seconds before actual expiry
 * @returns true if token is expired or about to expire
 */
export function isTokenExpired(
  expiresAt: number,
  bufferSeconds: number = 60,
): boolean {
  const now = Date.now()
  const bufferMs = bufferSeconds * 1000
  return now >= expiresAt - bufferMs
}

/**
 * Decodes a JWT token payload (without verification)
 * Use only for debugging/logging purposes
 *
 * @param token - The JWT token to decode
 * @returns Decoded payload or null if invalid
 */
export function decodeTokenPayload(token: string): any | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8')
    return JSON.parse(decoded)
  } catch (error) {
    console.error('[TokenUtils] Failed to decode token:', error)
    return null
  }
}
