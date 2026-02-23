'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createUserAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft, Loader2, UserPlus, X } from 'lucide-react'
import Link from 'next/link'

export default function CreateUserPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <CreateUserForm />
    </Suspense>
  )
}

function CreateUserForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const realmParam = searchParams.get('realm') || 'hyper.io'
  const clientParam = searchParams.get('client') || 'my-app'

  const [realm] = useState(realmParam)
  const [client] = useState(clientParam)

  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  })

  const [roles, setRoles] = useState<string[]>([])
  const [roleInput, setRoleInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const addRole = () => {
    const trimmed = roleInput.trim()
    if (trimmed && !roles.includes(trimmed)) {
      setRoles((prev) => [...prev, trimmed])
      setRoleInput('')
    }
  }

  const removeRole = (role: string) => {
    setRoles((prev) => prev.filter((r) => r !== role))
  }

  const handleRoleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addRole()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validation
    if (!formData.userName.trim()) {
      setError('Username is required')
      return
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }
    if (!formData.password) {
      setError('Password is required')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const result = await createUserAction(realm, client, {
      userName: formData.userName,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      roles,
    })

    setLoading(false)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push(`/admin/users?realm=${encodeURIComponent(realm)}&client=${encodeURIComponent(client)}`)
      }, 1500)
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/users?realm=${encodeURIComponent(realm)}&client=${encodeURIComponent(client)}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create User</h1>
          <p className="text-muted-foreground">
            Add a new user to <strong>{realm}</strong> / <strong>{client}</strong>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-5 w-5" />
                User Information
              </CardTitle>
              <CardDescription>
                Basic account details for the new user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Username *</Label>
                <Input
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  placeholder="john.doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+5511999999999"
                />
              </div>
            </CardContent>
          </Card>

          {/* Password & Roles */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Security</CardTitle>
                <CardDescription>Set the user&apos;s password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Roles</CardTitle>
                <CardDescription>
                  Assign roles to this user (press Enter to add)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onKeyDown={handleRoleKeyDown}
                    placeholder="e.g. Admin"
                  />
                  <Button type="button" variant="outline" onClick={addRole}>
                    Add
                  </Button>
                </div>

                {roles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary"
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() => removeRole(role)}
                          className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {roles.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No roles assigned yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <p className="font-medium">Success!</p>
            <p>User created successfully. Redirecting...</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-4">
          <Link href={`/admin/users?realm=${encodeURIComponent(realm)}&client=${encodeURIComponent(client)}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading || success}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
