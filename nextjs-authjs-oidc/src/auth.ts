import NextAuth from "next-auth"
import { OIDCConfig, OIDCUserConfig } from "next-auth/providers";
import { refreshAccessToken } from "./lib/auth/refresh-token";
import { isTokenExpired } from "./lib/auth/token-utils";
import { TOKEN_EXPIRATION_BUFFER_SECONDS } from "./lib/auth/constants";
//import GitHub from "next-auth/providers/github";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AuthioProfile extends Record<string, any> {
  exp: number
  iat: number
  auth_time: number
  jti: string
  iss: string
  aud: string
  sub: string
  typ: string
  azp: string
  session_state: string
  at_hash: string
  acr: string
  sid: string
  email_verified: boolean
  name: string
  preferred_username: string
  given_name: string
  family_name: string
  email: string
  picture: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any
}

/**
 * Add Keycloak login to your page.
 *
 * ### Setup
 *
 * #### Callback URL
 * ```
 * https://example.com/api/auth/callback/keycloak
 * ```
 *
 * #### Configuration
 *```ts
 * import { Auth } from "@auth/core"
 * import Keycloak from "@auth/core/providers/keycloak"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Keycloak({
 *       clientId: KEYCLOAK_CLIENT_ID,
 *       clientSecret: KEYCLOAK_CLIENT_SECRET,
 *       issuer: KEYCLOAK_ISSUER,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### Resources
 *
 *  - [Keycloak OIDC documentation](https://www.keycloak.org/docs/latest/server_admin/#_oidc_clients)
 *
 * :::tip
 *
 * Create an openid-connect client in Keycloak with "confidential" as the "Access Type".
 *
 * :::
 *
 * :::note
 *
 * issuer should include the realm – e.g. https://my-keycloak-domain.com/realms/My_Realm
 *
 * :::
 * ### Notes
 *
 * By default, Auth.js assumes that the Keycloak provider is
 * based on the [Open ID Connect](https://openid.net/specs/openid-connect-core-1_0.html) specification.
 *
 * :::tip
 *
 * The Keycloak provider comes with a [default configuration](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/keycloak.ts).
 * To override the defaults for your use case, check out [customizing a built-in OAuth provider](https://authjs.dev/guides/configuring-oauth-providers).
 *
 * :::
 *
 * :::info **Disclaimer**
 *
 * If you think you found a bug in the default configuration, you can [open an issue](https://authjs.dev/new/provider-issue).
 *
 * Auth.js strictly adheres to the specification and it cannot take responsibility for any deviation from
 * the spec by the provider. You can open an issue, but if the problem is non-compliance with the spec,
 * we might not pursue a resolution. You can ask for more help in [Discussions](https://authjs.dev/new/github-discussions).
 *
 * :::
 */
export default function Authio<P extends AuthioProfile>(
  options: OIDCUserConfig<P>
): OIDCConfig<P> {
  debugger
  return {
    id: "Authio",
    name: "Authio",
    type: "oidc",
    style: { brandColor: "#428bca" },
    options,
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  providers: [
    Authio({
      issuer: process.env.NEXT_PUBLIC_AUTH_OIDC_ISSUER,
      clientId: process.env.AUTHIO_ID,
      clientSecret: process.env.AUTH_SECRET,
      checks: ['pkce', 'state', 'nonce'],
      authorization: { params: { scope: "openid email profile" } },
    })
  ],
  secret: process.env.AUTH_SECRET,
  // pages: {
  //   error: '/auth-error',
  // },
  callbacks: {
    async jwt({ token, user, account }) {
      debugger
      
      // Initial sign in - store tokens from account
      if (account && user) {
        console.log('[Auth] Initial sign in, storing tokens')
        token.username = user.username
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.idToken = account.id_token
        token.accessTokenExpires = account.expires_at 
          ? account.expires_at * 1000 
          : Date.now() + (account.expires_in || 3600) * 1000
        return token
      }

      // Token is still valid, return it as is
      if (token.accessTokenExpires && !isTokenExpired(token.accessTokenExpires, TOKEN_EXPIRATION_BUFFER_SECONDS)) {
        console.log('[Auth] Token still valid')
        return token
      }

      // Token is expired or about to expire, refresh it
      console.log('[Auth] Token expired or expiring soon, refreshing...')
      const refreshedToken = await refreshAccessToken(token)
      return refreshedToken
    },
    session({ session, token }) {
      debugger
      
      // Pass user info to session
      session.user.username = token.username
      session.user.id = token.sub || ''
      session.user.name = token.name || ''
      session.user.email = token.email || ''
      session.id_token = token.idToken
      
      // Pass error to session if token refresh failed
      if (token.error) {
        session.error = token.error
      }
      
      return session
    }
  }
})