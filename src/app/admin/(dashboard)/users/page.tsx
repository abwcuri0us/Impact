'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  UserCog,
  Key,
  ShieldCheck,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserRecord {
  id: string;
  username: string;
  displayName: string;
  role: string;
  permissions: Record<string, { read: boolean; write: boolean }>;
  isActive: boolean;
  failedAttempts: number;
  lockedUntil: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Permissions {
  [section: string]: { read: boolean; write: boolean };
}

const sections = ['courses', 'faculty', 'gallery', 'videos', 'certificates', 'enquiries'];

function parsePermissions(perm: unknown): Permissions {
  if (typeof perm === 'object' && perm !== null) return perm as Permissions;
  if (typeof perm === 'string') {
    try { return JSON.parse(perm); } catch { return {}; }
  }
  return {};
}

function getDefaultPermissions(): Permissions {
  return {
    courses: { read: true, write: true },
    faculty: { read: true, write: true },
    gallery: { read: true, write: true },
    videos: { read: true, write: true },
    certificates: { read: true, write: true },
    enquiries: { read: true, write: false },
  };
}

const emptyForm = {
  username: '',
  password: '',
  displayName: '',
  role: 'admin',
  isActive: true,
  permissions: getDefaultPermissions(),
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [createForm, setCreateForm] = useState<typeof emptyForm & { permissions: Permissions }>(emptyForm);
  const [editForm, setEditForm] = useState<{ displayName: string; role: string; isActive: boolean; permissions: Permissions }>({
    displayName: '',
    role: 'admin',
    isActive: true,
    permissions: getDefaultPermissions(),
  });
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setCreateForm({ ...emptyForm, permissions: getDefaultPermissions() });
    setCreateOpen(true);
  };

  const openEdit = (user: UserRecord) => {
    setSelectedUser(user);
    setEditForm({
      displayName: user.displayName,
      role: user.role,
      isActive: user.isActive,
      permissions: parsePermissions(user.permissions),
    });
    setEditOpen(true);
  };

  const openPassword = (user: UserRecord) => {
    setSelectedUser(user);
    setNewPassword('');
    setPasswordOpen(true);
  };

  const openDelete = (user: UserRecord) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleCreate = async () => {
    if (!createForm.username || !createForm.password || !createForm.displayName) {
      toast.error('All fields are required');
      return;
    }
    if (createForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: createForm.username,
          password: createForm.password,
          displayName: createForm.displayName,
          role: createForm.role,
          isActive: createForm.isActive,
          permissions: createForm.permissions,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create user');
      }

      toast.success('User created successfully');
      setCreateOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: editForm.displayName,
          role: editForm.role,
          isActive: editForm.isActive,
          permissions: JSON.stringify(editForm.permissions),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update user');
      }

      toast.success('User updated successfully');
      setEditOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async () => {
    if (!selectedUser || !newPassword) {
      toast.error('New password is required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to change password');
      }

      toast.success('Password changed successfully');
      setPasswordOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to deactivate user');
      }

      toast.success('User deactivated successfully');
      setDeleteOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate user');
    } finally {
      setSaving(false);
    }
  };

  const getUserStatus = (user: UserRecord) => {
    if (!user.isActive) return { label: 'Inactive', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: XCircle };
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) return { label: 'Locked', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: Lock };
    return { label: 'Active', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle2 };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="hidden md:block space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">
            {users.length} user{users.length !== 1 ? 's' : ''} total
            &middot; {users.filter((u) => u.isActive).length} active
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 flex items-center justify-center mx-auto mb-4">
                <UserCog className="w-8 h-8 text-brand-purple" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No users yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Create your first admin user to get started.</p>
              <Button onClick={openCreate} className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            <AnimatePresence>
              {users.map((user, index) => {
                const status = getUserStatus(user);
                const StatusIcon = status.icon;
                return (
                  <motion.div key={user.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.05 }}>
                    <Card className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
                              <UserCog className="w-5 h-5 text-brand-purple" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-semibold text-sm truncate">{user.displayName}</h3>
                                <Badge className={`text-[10px] px-1.5 py-0 ${status.color} border`}>
                                  <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
                                  {status.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">@{user.username} &middot; <span className="capitalize">{user.role}</span></p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <span>Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => openEdit(user)}>
                            <Pencil className="w-3 h-3" />Edit
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => openPassword(user)}>
                            <Key className="w-3 h-3" />Password
                          </Button>
                          {user.isActive && (
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-red-500" onClick={() => openDelete(user)}>
                              <Trash2 className="w-3 h-3" />Deactivate
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">User</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Role</th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Status</th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Last Login</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {users.map((user, index) => {
                        const status = getUserStatus(user);
                        const StatusIcon = status.icon;
                        return (
                          <motion.tr key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: index * 0.03 }} className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${!user.isActive ? 'opacity-60' : ''}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center flex-shrink-0">
                                  <UserCog className="w-5 h-5 text-brand-purple" />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-medium text-sm">{user.displayName}</span>
                                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className="capitalize bg-brand-purple/10 text-brand-purple border-brand-purple/20 text-[10px]">
                                {user.role}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Badge className={`text-[10px] ${status.color} border`}>
                                <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
                                {status.label}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-muted-foreground">
                                {user.lastLogin
                                  ? new Date(user.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                  : 'Never'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(user)} title="Edit user">
                                  <Pencil className="w-4 h-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openPassword(user)} title="Change password">
                                  <Key className="w-4 h-4" />
                                  <span className="sr-only">Change Password</span>
                                </Button>
                                {user.isActive && (
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => openDelete(user)} title="Deactivate user">
                                    <Trash2 className="w-4 h-4" />
                                    <span className="sr-only">Deactivate</span>
                                  </Button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new admin user with permissions.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="create-username">Username <span className="text-destructive">*</span></Label>
              <Input
                id="create-username"
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                placeholder="e.g. john"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Password <span className="text-destructive">*</span></Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
              />
              {createForm.password && createForm.password.length < 8 && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Password must be at least 8 characters
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-displayname">Display Name <span className="text-destructive">*</span></Label>
              <Input
                id="create-displayname"
                value={createForm.displayName}
                onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={createForm.role} onValueChange={(v) => setCreateForm({ ...createForm, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Permission Editor */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Permissions</Label>
              <div className="border rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  <span>Section</span>
                  <span className="text-center">Read</span>
                  <span className="text-center hidden sm:block">Write</span>
                </div>
                {sections.map((section) => (
                  <div key={section} className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-center py-1">
                    <span className="text-sm capitalize">{section}</span>
                    <div className="flex justify-center">
                      <Checkbox
                        checked={createForm.permissions[section]?.read || false}
                        onCheckedChange={(checked) =>
                          setCreateForm({
                            ...createForm,
                            permissions: {
                              ...createForm.permissions,
                              [section]: {
                                read: checked === true,
                                write: checked === true ? (createForm.permissions[section]?.write || false) : false,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex justify-center hidden sm:flex">
                      <Checkbox
                        checked={createForm.permissions[section]?.write || false}
                        onCheckedChange={(checked) =>
                          setCreateForm({
                            ...createForm,
                            permissions: {
                              ...createForm.permissions,
                              [section]: {
                                read: checked === true ? true : (createForm.permissions[section]?.read || false),
                                write: checked === true,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={saving || !createForm.username || !createForm.password || !createForm.displayName || createForm.password.length < 8}
              className="bg-brand-purple hover:bg-brand-purple-dark"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Creating...</> : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.displayName}</DialogTitle>
            <DialogDescription>Update user details and permissions.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-displayname">Display Name</Label>
              <Input
                id="edit-displayname"
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={editForm.isActive}
                onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
              />
              <Label className="cursor-pointer">Active</Label>
              {!editForm.isActive && (
                <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px]">
                  Account will be deactivated
                </Badge>
              )}
            </div>

            {/* Permission Editor */}
            <div className="space-y-3 pt-2">
              <Label className="text-sm font-semibold">Permissions</Label>
              <div className="border rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  <span>Section</span>
                  <span className="text-center">Read</span>
                  <span className="text-center hidden sm:block">Write</span>
                </div>
                {sections.map((section) => (
                  <div key={section} className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-center py-1">
                    <span className="text-sm capitalize">{section}</span>
                    <div className="flex justify-center">
                      <Checkbox
                        checked={editForm.permissions[section]?.read || false}
                        onCheckedChange={(checked) =>
                          setEditForm({
                            ...editForm,
                            permissions: {
                              ...editForm.permissions,
                              [section]: {
                                read: checked === true,
                                write: checked === true ? (editForm.permissions[section]?.write || false) : false,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex justify-center hidden sm:flex">
                      <Checkbox
                        checked={editForm.permissions[section]?.write || false}
                        onCheckedChange={(checked) =>
                          setEditForm({
                            ...editForm,
                            permissions: {
                              ...editForm.permissions,
                              [section]: {
                                read: checked === true ? true : (editForm.permissions[section]?.read || false),
                                write: checked === true,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving} className="bg-brand-purple hover:bg-brand-purple-dark">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Saving...</> : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="sm:max-w-[450px] mx-2">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{selectedUser?.displayName}</strong> (@{selectedUser?.username}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password <span className="text-destructive">*</span></Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
              />
              {newPassword && newPassword.length < 8 && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Password must be at least 8 characters
                </p>
              )}
            </div>
            {selectedUser && selectedUser.failedAttempts > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-700 dark:text-amber-400">
                  This user has {selectedUser.failedAttempts} failed login attempt{selectedUser.failedAttempts !== 1 ? 's' : ''}.
                  Changing the password will reset this counter and unlock the account.
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)} disabled={saving}>Cancel</Button>
            <Button
              onClick={handlePassword}
              disabled={saving || !newPassword || newPassword.length < 8}
              className="bg-brand-purple hover:bg-brand-purple-dark"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Updating...</> : 'Change Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate <strong>{selectedUser?.displayName}</strong> (@{selectedUser?.username})?
              They will no longer be able to log in. This can be reversed by editing the user later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Deactivating...</> : 'Deactivate User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
