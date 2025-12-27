'use client';

import { signOut, useSession } from "next-auth/react";
import { Button } from "./button";

export default function SignOutButton() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    debugger
    const idToken = session?.id_token;

    // Endpoint de logout do Keycloak
    const logoutUrl = new URL(`${process.env.NEXT_PUBLIC_AUTH_OIDC_ISSUER}/protocol/openid-connect/logout`);
    logoutUrl.searchParams.append("id_token_hint", idToken || "");
    logoutUrl.searchParams.append("post_logout_redirect_uri", `${window.location.origin}/sign-in`);

   window.location.href = logoutUrl.toString();

    //signOut();
  };

  return (
    <Button onClick={handleLogout} variant="outline">Sign out</Button>
  );
}