# Sistema de Refresh Token - NextAuth.js + OIDC

Este projeto implementa um sistema robusto de refresh token para autenticação OIDC usando NextAuth.js.

## 📁 Estrutura de Arquivos

```
src/lib/auth/
├── constants.ts       # Constantes de configuração OIDC
├── token-utils.ts     # Utilitários para validação de tokens
├── refresh-token.ts   # Lógica de refresh de token
└── index.ts          # Exports centralizados
```

## 🚀 Funcionalidades

### 1. **Refresh Automático de Tokens**
- Detecta quando o token está expirando (60 segundos antes)
- Tenta automaticamente renovar o token usando o refresh token
- Implementa retry logic com exponential backoff

### 2. **Tratamento Robusto de Erros**
- Códigos de erro padronizados
- Logging detalhado para debugging
- Diferencia erros permanentes (não retenta) de erros temporários

### 3. **Validação de Tokens**
- Valida formato JWT
- Valida estrutura da resposta OIDC
- Verifica expiração com buffer de segurança

### 4. **Segurança**
- Mascaramento de tokens em logs
- Validação de configuração OIDC
- Seguir especificações RFC 6749 e OpenID Connect

## 🔧 Configuração

### Variáveis de Ambiente (.env.local)

```env
# OIDC Issuer URL (inclui realm e client path se necessário)
NEXT_PUBLIC_AUTH_OIDC_ISSUER=https://localhost:7207/realms/hyper.io

# Client ID do provedor OIDC
AUTHIO_ID="my-app"

# Client Secret (usado tanto para auth quanto para refresh)
AUTH_SECRET="pcb6nD0wz6LZ56gKs9VC50aCQXOIutd5zExje0twAHXy40m1DcPJopKjGf-gS4Wf"
```

**Importante:** O endpoint de token será automaticamente construído como:
```
{NEXT_PUBLIC_AUTH_OIDC_ISSUER}/protocol/openid-connect/token
```

## 📝 Como Funciona

### Fluxo de Autenticação

1. **Login Inicial**
   - Usuário faz login via OIDC
   - Recebe: `access_token`, `refresh_token`, `id_token`
   - Tokens são armazenados na sessão JWT

2. **Verificação Automática**
   - A cada requisição que usa a sessão
   - NextAuth verifica se o token está expirando
   - Se sim, chama `refreshAccessToken()`

3. **Refresh do Token**
   - Tenta até 3 vezes (configurável)
   - Usa exponential backoff (1s, 2s, 3s)
   - Retorna novos tokens ou sinaliza erro

4. **Tratamento de Erro**
   - Erros permanentes (400): não retenta
   - Erros temporários: retenta com backoff
   - Session recebe flag de erro se refresh falhar

### Callbacks do NextAuth

```typescript
callbacks: {
  async jwt({ token, user, account }) {
    // Login inicial - armazena tokens
    if (account && user) {
      return {
        ...token,
        accessToken: account.access_token,
        refreshToken: account.refresh_token,
        accessTokenExpires: account.expires_at * 1000,
      }
    }

    // Token válido - retorna sem mudanças
    if (!isTokenExpired(token.accessTokenExpires)) {
      return token
    }

    // Token expirando - refresh automático
    return await refreshAccessToken(token)
  },
  
  session({ session, token }) {
    // Passa dados do token para sessão
    session.user = { ...token }
    session.error = token.error // Se refresh falhou
    return session
  }
}
```

## 🔍 Logs e Debugging

O sistema produz logs detalhados:

```
[TokenRefresh] Starting refresh process { hasRefreshToken: true, tokenMask: 'eyJhbGciO...Wf' }
[TokenRefresh] Attempting token refresh...
[TokenRefresh] Token refreshed successfully { attempt: 1, expiresIn: 3600, hasNewRefreshToken: true }
```

Em caso de erro:
```
[TokenRefresh] Attempt 1 failed: { error: 'invalid_grant', code: 'RefreshTokenExpired', statusCode: 400 }
[TokenRefresh] Permanent error detected, not retrying
```

## 🛡️ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| `RefreshAccessTokenError` | Erro genérico no refresh |
| `RefreshTokenExpired` | Refresh token expirou (requer novo login) |
| `InvalidToken` | Token inválido ou mal formatado |
| `NetworkError` | Erro de rede ou configuração |
| `SessionExpired` | Sessão expirou |

## 🎯 Uso no Frontend

### Verificar Erro de Sessão

```typescript
'use client'
import { useSession } from 'next-auth/react'

export function SessionChecker() {
  const { data: session } = useSession()
  
  if (session?.error === 'RefreshAccessTokenError') {
    // Token expirou, redirecionar para login
    signOut({ callbackUrl: '/sign-in' })
  }
  
  return <div>Session válida</div>
}
```

### Proteção de Rotas

```typescript
// middleware.ts
import { auth } from './auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const session = req.auth
  
  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
  
  // Se há erro de refresh, redireciona
  if (session.error) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
  
  return NextResponse.next()
})
```

## ⚙️ Configurações Customizáveis

### constants.ts

```typescript
// Número de tentativas de refresh
export const MAX_REFRESH_RETRY_ATTEMPTS = 3

// Delay base entre tentativas (ms)
export const REFRESH_RETRY_DELAY_MS = 1000

// Buffer antes da expiração (segundos)
export const TOKEN_EXPIRATION_BUFFER_SECONDS = 60
```

## 🧪 Testando

1. **Testar Login**
   ```bash
   npm run dev
   # Acesse http://localhost:3000 e faça login
   ```

2. **Testar Refresh**
   - Modifique `TOKEN_EXPIRATION_BUFFER_SECONDS` para um valor alto (ex: 3600)
   - O refresh será acionado imediatamente após login
   - Verifique os logs no console

3. **Testar Erro de Refresh**
   - Invalide o `AUTHIO_ID` ou `AUTH_SECRET`
   - Tente fazer refresh
   - Deve ver erro nos logs e na session

## 📚 Referências

- [RFC 6749 - OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [NextAuth.js JWT Callback](https://next-auth.js.org/configuration/callbacks#jwt-callback)
- [NextAuth.js Session Callback](https://next-auth.js.org/configuration/callbacks#session-callback)

## 🤝 Contribuindo

Para adicionar novos provedores OIDC, ajuste o endpoint em `constants.ts`:

```typescript
export const OIDC_TOKEN_ENDPOINT = '/seu-provedor/token'
```

## 📄 Licença

MIT
