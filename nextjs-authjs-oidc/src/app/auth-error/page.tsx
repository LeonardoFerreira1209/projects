"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: "Erro de Configuração",
      description: "Há um problema na configuração do servidor de autenticação.",
    },
    AccessDenied: {
      title: "Acesso Negado",
      description: "Você não tem permissão para acessar este recurso.",
    },
    Verification: {
      title: "Erro de Verificação",
      description: "O token de verificação expirou ou já foi usado.",
    },
    OAuthSignin: {
      title: "Erro ao Iniciar Login",
      description: "Ocorreu um erro ao tentar iniciar o processo de autenticação.",
    },
    OAuthCallback: {
      title: "Erro no Callback",
      description: "Ocorreu um erro ao processar a resposta do provedor de autenticação.",
    },
    OAuthCreateAccount: {
      title: "Erro ao Criar Conta",
      description: "Não foi possível criar sua conta. Tente novamente.",
    },
    EmailCreateAccount: {
      title: "Erro ao Criar Conta",
      description: "Não foi possível criar sua conta com este e-mail.",
    },
    Callback: {
      title: "Erro no Callback",
      description: "Ocorreu um erro durante o processo de autenticação.",
    },
    OAuthAccountNotLinked: {
      title: "Conta Não Vinculada",
      description: "Este e-mail já está associado a outra forma de login. Use o método original.",
    },
    EmailSignin: {
      title: "Erro no Login por E-mail",
      description: "Não foi possível enviar o e-mail de verificação.",
    },
    CredentialsSignin: {
      title: "Credenciais Inválidas",
      description: "As credenciais fornecidas estão incorretas. Verifique e tente novamente.",
    },
    SessionRequired: {
      title: "Sessão Necessária",
      description: "Você precisa estar autenticado para acessar esta página.",
    },
    RefreshAccessTokenError: {
      title: "Erro ao Renovar Token",
      description: "Sua sessão expirou. Por favor, faça login novamente.",
    },
    default: {
      title: "Erro de Autenticação",
      description: "Ocorreu um erro inesperado durante a autenticação.",
    },
  }

  const errorInfo = error ? errorMessages[error] || errorMessages.default : errorMessages.default

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-10 w-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            {errorInfo.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{errorInfo.description}</p>
          {error && (
            <p className="mt-1 text-xs text-gray-500">
              Código de erro: <span className="font-mono">{error}</span>
            </p>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <Link href="/sign-in" className="block">
            <Button className="w-full">
              Tentar Novamente
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Voltar para Início
            </Button>
          </Link>
        </div>

        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                Precisa de ajuda?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Se o problema persistir, entre em contato com o suporte técnico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
