'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getUsersAction } from '@/app/admin/actions'
import { User, PaginatedResponse } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  Users,
} from 'lucide-react'

const DEFAULT_REALM = 'hyper.io'
const DEFAULT_CLIENT = 'my-app'
const PAGE_SIZE = 10

export default function UsersPage() {
  const [realm, setRealm] = useState(DEFAULT_REALM)
  const [client, setClient] = useState(DEFAULT_CLIENT)
  const [pageNumber, setPageNumber] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<PaginatedResponse<User> | null>(null)

  const fetchUsers = useCallback(async (page: number = 1) => {
    if (!realm.trim() || !client.trim()) {
      setError('Realm and Client are required')
      return
    }

    setLoading(true)
    setError(null)

    const result = await getUsersAction(realm, client, page, PAGE_SIZE)

    if (result.success && result.data) {
      setData(result.data)
      setPageNumber(page)
    } else {
      setError(result.error || 'Failed to fetch users')
      setData(null)
    }

    setLoading(false)
  }, [realm, client])

  // Load users on mount
  useEffect(() => {
    fetchUsers(1)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const users = data?.pagination?.items ?? []
  const totalCount = data?.pagination?.totalCount ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success' as const
      case 'inactive':
        return 'secondary' as const
      case 'blocked':
        return 'destructive' as const
      default:
        return 'outline' as const
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage users for your realm and client
          </p>
        </div>
        <Link href={`/admin/users/create?realm=${encodeURIComponent(realm)}&client=${encodeURIComponent(client)}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New User
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="realm">Realm</Label>
              <Input
                id="realm"
                value={realm}
                onChange={(e) => setRealm(e.target.value)}
                placeholder="e.g. hyper.io"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g. my-app"
              />
            </div>
            <Button onClick={() => fetchUsers(1)} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" />
            Users
            {totalCount > 0 && (
              <Badge variant="secondary">{totalCount}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="mb-4 h-12 w-12" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">
                Try adjusting the realm and client, or create a new user.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{user.userName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell className="text-sm">
                        {user.phoneNumber || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.userRoles?.length > 0 ? (
                            user.userRoles.map((ur) => (
                              <Badge key={ur.roleId} variant="outline">
                                {ur.role?.name || ur.roleId}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No roles
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.created)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pageNumber} of {totalPages} ({totalCount} total users)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchUsers(pageNumber - 1)}
                      disabled={pageNumber <= 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchUsers(pageNumber + 1)}
                      disabled={pageNumber >= totalPages || loading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
