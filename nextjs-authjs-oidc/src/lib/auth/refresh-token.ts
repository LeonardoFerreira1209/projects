import { JWT } from 'next-auth/jwt'
import {
  OIDC_TOKEN_ENDPOINT,
  GRANT_TYPE,
  AUTH_ERROR_CODE,
  MAX_REFRESH_RETRY_ATTEMPTS,
  REFRESH_RETRY_DELAY_MS,
} from './constants'
import { validateToken, maskToken } from './token-utils'

/**
 * OIDC Token Response Interface
 * Based on RFC 6749 (OAuth 2.0) and OpenID Connect specifications
 */
interface OIDCTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  id_token?: string
  scope?: string
}

/**
 * Token refresh error with detailed information
 */
class TokenRefreshError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public originalError?: unknown,
  ) {
    super(message)
    this.name = 'TokenRefreshError'
  }
}

/**
 * Validates the OIDC token response
 *
 * @param response - The token response to validate
 * @throws TokenRefreshError if response is invalid
 */
function validateTokenResponse(response: OIDCTokenResponse): void {
  if (!response.access_token) {
    throw new TokenRefreshError(
      'Missing access_token in response',
      AUTH_ERROR_CODE.INVALID_TOKEN,
    )
  }

  if (!response.expires_in || response.expires_in <= 0) {
    throw new TokenRefreshError(
      'Invalid expires_in value',
      AUTH_ERROR_CODE.INVALID_TOKEN,
    )
  }

  // Validate the access token format
  const validation = validateToken(response.access_token)
  if (!validation.isValid) {
    throw new TokenRefreshError(
      'Received invalid access token',
      AUTH_ERROR_CODE.INVALID_TOKEN,
    )
  }
}

/**
 * Delays execution for retry logic
 *
 * @param ms - Milliseconds to wait
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Performs the actual token refresh HTTP request
 *
 * @param refreshToken - The refresh token to use
 * @returns The OIDC token response
 * @throws TokenRefreshError on failure
 */
async function performTokenRefresh(
  refreshToken: string,
): Promise<OIDCTokenResponse> {
  const issuer = process.env.NEXT_PUBLIC_AUTH_OIDC_ISSUER
  const clientId = process.env.AUTHIO_ID
  const clientSecret = process.env.AUTH_SECRET

  if (!issuer || !clientId || !clientSecret) {
    throw new TokenRefreshError(
      'Missing OIDC configuration',
      AUTH_ERROR_CODE.NETWORK_ERROR,
    )
  }

  const tokenEndpoint = `${issuer}${OIDC_TOKEN_ENDPOINT}`

  console.log('[TokenRefresh] Attempting token refresh...')

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: GRANT_TYPE.REFRESH_TOKEN,
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorDescription =
      errorData.error_description || errorData.error || 'Unknown error'

    console.error('[TokenRefresh] Refresh failed:', {
      status: response.status,
      error: errorDescription,
    })

    // Determine error code based on response
    let errorCode: string = AUTH_ERROR_CODE.REFRESH_TOKEN_ERROR
    if (response.status === 400 && errorData.error === 'invalid_grant') {
      errorCode = AUTH_ERROR_CODE.REFRESH_TOKEN_EXPIRED
    }

    throw new TokenRefreshError(
      errorDescription,
      errorCode,
      response.status,
      errorData,
    )
  }

  const tokenData: OIDCTokenResponse = await response.json()
  console.log('[TokenRefresh] Token refreshed successfully')

  return tokenData
}

/**
 * Refreshes the access token using the refresh token
 * Implements retry logic and comprehensive error handling
 * Follows OIDC best practices
 *
 * @param token - The current JWT token object
 * @returns Updated JWT token object or token with error
 */
export async function refreshAccessToken(token: JWT): Promise<JWT> {
  const refreshToken = token.refreshToken as string | undefined

  // Validate refresh token exists
  if (!refreshToken) {
    console.error('[TokenRefresh] No refresh token available')
    return {
      ...token,
      error: AUTH_ERROR_CODE.REFRESH_TOKEN_ERROR,
      accessToken: undefined,
    }
  }

  console.log('[TokenRefresh] Starting refresh process', {
    hasRefreshToken: !!refreshToken,
    tokenMask: maskToken(refreshToken),
  })

  let lastError: TokenRefreshError | null = null

  // Retry logic for transient failures
  for (let attempt = 1; attempt <= MAX_REFRESH_RETRY_ATTEMPTS; attempt++) {
    try {
      // Attempt refresh
      const tokenResponse = await performTokenRefresh(refreshToken)

      // Validate response
      validateTokenResponse(tokenResponse)

      // Calculate expiration time
      const expiresAt = Date.now() + tokenResponse.expires_in * 1000

      console.log('[TokenRefresh] Token refresh successful', {
        attempt,
        expiresIn: tokenResponse.expires_in,
        hasNewRefreshToken: !!tokenResponse.refresh_token,
      })

      // Return updated token
      return {
        ...token,
        accessToken: tokenResponse.access_token,
        accessTokenExpires: expiresAt,
        refreshToken: tokenResponse.refresh_token ?? refreshToken,
        idToken: tokenResponse.id_token ?? token.idToken,
        error: undefined, // Clear any previous errors
      }
    } catch (error) {
      lastError =
        error instanceof TokenRefreshError
          ? error
          : new TokenRefreshError(
              'Unexpected error during token refresh',
              AUTH_ERROR_CODE.NETWORK_ERROR,
              undefined,
              error,
            )

      console.error(`[TokenRefresh] Attempt ${attempt} failed:`, {
        error: lastError.message,
        code: lastError.code,
        statusCode: lastError.statusCode,
      })

      // Don't retry if it's a permanent error (400 Bad Request, expired refresh token)
      if (
        lastError.code === AUTH_ERROR_CODE.REFRESH_TOKEN_EXPIRED ||
        lastError.statusCode === 400
      ) {
        console.error('[TokenRefresh] Permanent error detected, not retrying')
        break
      }

      // Wait before retrying (exponential backoff)
      if (attempt < MAX_REFRESH_RETRY_ATTEMPTS) {
        const waitTime = REFRESH_RETRY_DELAY_MS * attempt
        console.log(`[TokenRefresh] Waiting ${waitTime}ms before retry...`)
        await delay(waitTime)
      }
    }
  }

  // All attempts failed
  console.error('[TokenRefresh] All refresh attempts failed', {
    lastError: lastError?.message,
    code: lastError?.code,
  })

  return {
    ...token,
    error: lastError?.code ?? AUTH_ERROR_CODE.REFRESH_TOKEN_ERROR,
    accessToken: undefined,
  }
}
