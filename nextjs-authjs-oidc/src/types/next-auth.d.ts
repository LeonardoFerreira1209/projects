Ref: https://next-auth.js.org/getting-started/typescript#module-augmentation
import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        id_token?: string,
        user: {
            id: string,
            username: string,
            name: string,
            email: string,
        } & DefaultSession
        error?: string
    }

    interface User extends DefaultUser {
        username: string
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        username: string
        idToken?: string
        accessToken?: string
        refreshToken?: string
        accessTokenExpires?: number
        error?: string
    }
}
