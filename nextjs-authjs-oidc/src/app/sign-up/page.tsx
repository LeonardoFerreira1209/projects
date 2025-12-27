import { signOut } from "next-auth/react";

export default function SignUpPage() {
    debugger
    signOut({ callbackUrl: '/' });
}