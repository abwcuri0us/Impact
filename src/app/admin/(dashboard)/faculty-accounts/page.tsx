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
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GraduationCap,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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

// ── Types ─────────────────────────────────────────────────────────────────

interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  branch: string;
  photo_url: string | null;
}

interface FacultyAccount {
  id: string;
  username: string;
  displayName: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  facultyId: string | null;
  facultyName: string;
  facultyDesignation: string;
  facultyBranch: string;
  facultyPhotoUrl: string;
  accessGranted: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function FacultyAccountsPage() {
  const [accounts, setAccounts] = useState<FacultyAccount[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<FacultyAccount | null>(null);

  // Create form
  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
    displayName: '',
    facultyId: '',
  });
  const [newPassword, setNewPassword] = useState('');

  // ── Fetch data ────────────────────────────────────────────────────────────

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/faculty-accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      } else {
        toast.error('Failed to fetch faculty accounts');
      }
    } catch {
      toast.error('Failed to fetch faculty accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFaculty = useCallback(async () => {
    try {
      const res = await fetch('/api/faculty');
      if (res.ok) {
        const data = await res.json();
        setFaculty(data);
      }
    } catch {
      // Silent fail for faculty list
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchFaculty();
  }, [fetchAccounts, fetchFaculty]);

  // Get faculty members that don't have accounts yet
  const availableFaculty = faculty.filter(
    (f) => !accounts.some((a) => a.facultyId === f.id)
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openCreate = () => {
    setCreateForm({ username: '', password: '', displayName: '', facultyId: '' });
    setCreateOpen(true);
  };

  const openPassword = (account: FacultyAccount) => {
    setSelectedAccount(account);
    setNewPassword('');
    setPasswordOpen(true);
  };

  const openDelete = (account: FacultyAccount) => {
    setSelectedAccount(account);
    setDeleteOpen(true);
  };

  const handleCreate = async () => {
    if (!createForm.username || !createForm.password || !createForm.displayName || !createForm.facultyId) {
      toast.error('All fields are required');
      return;
    }
    if (createForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/faculty-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create faculty account');
      }

      toast.success('Faculty account created successfully');
      setCreateOpen(false);
      fetchAccounts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create faculty account');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAccess = async (account: FacultyAccount) => {
    const newAccess = !account.accessGranted;
    const action = newAccess ? 'granting' : 'revoking';

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/faculty-accounts/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessGranted: newAccess }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed ${action} access`);
      }

      toast.success(
        newAccess
          ? `Access granted to ${account.displayName}`
          : `Access revoked from ${account.displayName}`
      );
      fetchAccounts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed ${action} access`);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!selectedAccount || !newPassword) {
      toast.error('New password is required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/faculty-accounts/${selectedAccount.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to reset password');
      }

      toast.success('Password reset successfully');
      setPasswordOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/faculty-accounts/${selectedAccount.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete faculty account');
      }

      toast.success('Faculty account deleted successfully');
      setDeleteOpen(false);
      fetchAccounts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete faculty account');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-52" />
        </div>
        <div className="hidden md:block space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
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
          <h2 className="text-2xl font-bold tracking-tight">Faculty Accounts</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Create login credentials for faculty members and control their access to add or make changes.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 bg-brand-purple hover:bg-brand-purple-dark"
          disabled={availableFaculty.length === 0}
        >
          <Plus className="w-4 h-4" />
          Create Faculty Account
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">How Faculty Access Works</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs opacity-80">
            <li>Create a username & password for each faculty member</li>
            <li>Faculty can log in at <strong>/faculty/login</strong> with their credentials</li>
            <li><strong>Access Granted</strong> = faculty can add and edit content (courses, gallery, etc.)</li>
            <li><strong>Access Revoked</strong> = faculty can only view content, cannot make changes</li>
          </ul>
        </div>
      </div>

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-brand-purple" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Faculty Accounts</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Create login credentials for your faculty members to allow them to access the system.
              </p>
              {availableFaculty.length > 0 ? (
                <Button onClick={openCreate} className="gap-2 bg-brand-purple hover:bg-brand-purple-dark">
                  <Plus className="w-4 h-4" />
                  Create Faculty Account
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Add faculty members first from the Faculty Members page.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            <AnimatePresence>
              {accounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Faculty Photo */}
                        <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {account.facultyPhotoUrl ? (
                            <img
                              src={account.facultyPhotoUrl}
                              alt={account.facultyName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserCog className="w-6 h-6 text-brand-purple" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-semibold text-sm truncate">{account.displayName}</h3>
                            <Badge
                              className={`text-[10px] px-1.5 py-0 border ${
                                account.accessGranted
                                  ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              }`}
                            >
                              {account.accessGranted ? (
                                <>
                                  <Unlock className="w-2.5 h-2.5 mr-0.5" />
                                  Access Granted
                                </>
                              ) : (
                                <>
                                  <Lock className="w-2.5 h-2.5 mr-0.5" />
                                  Access Revoked
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            @{account.username} &middot; {account.facultyName}
                          </p>
                          {account.facultyDesignation && (
                            <p className="text-xs text-muted-foreground">{account.facultyDesignation}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span>Created: {new Date(account.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>&middot;</span>
                        <span>Last login: {account.lastLogin ? new Date(account.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                        {/* Toggle Access */}
                        <div className="flex items-center gap-2 flex-1">
                          <Switch
                            checked={account.accessGranted}
                            onCheckedChange={() => handleToggleAccess(account)}
                            disabled={saving}
                          />
                          <span className="text-xs text-muted-foreground">
                            {account.accessGranted ? 'Edit Access ON' : 'Edit Access OFF'}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1"
                          onClick={() => openPassword(account)}
                        >
                          <Key className="w-3 h-3" />Password
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1 text-red-500"
                          onClick={() => openDelete(account)}
                        >
                          <Trash2 className="w-3 h-3" />Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Faculty Member
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Login Credentials
                      </th>
                      <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Edit Access
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Last Login
                      </th>
                      <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {accounts.map((account, index) => (
                        <motion.tr
                          key={account.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.03 }}
                          className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${
                            !account.isActive ? 'opacity-60' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {account.facultyPhotoUrl ? (
                                  <img
                                    src={account.facultyPhotoUrl}
                                    alt={account.facultyName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Users className="w-5 h-5 text-brand-purple" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="font-medium text-sm block">{account.displayName}</span>
                                <p className="text-xs text-muted-foreground">
                                  {account.facultyName}
                                  {account.facultyDesignation && ` · ${account.facultyDesignation}`}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <span className="text-sm font-mono">@{account.username}</span>
                              <p className="text-xs text-muted-foreground">
                                Created: {new Date(account.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Switch
                                checked={account.accessGranted}
                                onCheckedChange={() => handleToggleAccess(account)}
                                disabled={saving}
                              />
                              <Badge
                                className={`text-[10px] px-2 py-0.5 border ${
                                  account.accessGranted
                                    ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                }`}
                              >
                                {account.accessGranted ? (
                                  <>
                                    <Unlock className="w-3 h-3 mr-0.5" />
                                    Granted
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3 h-3 mr-0.5" />
                                    Revoked
                                  </>
                                )}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-muted-foreground">
                              {account.lastLogin
                                ? new Date(account.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                : 'Never'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => openPassword(account)}
                                title="Reset password"
                              >
                                <Key className="w-4 h-4" />
                                <span className="sr-only">Reset Password</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => openDelete(account)}
                                title="Delete account"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Create Account Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-2">
          <DialogHeader>
            <DialogTitle>Create Faculty Account</DialogTitle>
            <DialogDescription>
              Create login credentials for a faculty member. They will be able to log in at /faculty/login.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Faculty Member Selection */}
            <div className="space-y-2">
              <Label htmlFor="select-faculty">Faculty Member <span className="text-destructive">*</span></Label>
              <Select
                value={createForm.facultyId}
                onValueChange={(v) => {
                  const selected = faculty.find((f) => f.id === v);
                  setCreateForm({
                    ...createForm,
                    facultyId: v,
                    displayName: selected ? selected.name : createForm.displayName,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a faculty member" />
                </SelectTrigger>
                <SelectContent>
                  {availableFaculty.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} — {f.designation}
                    </SelectItem>
                  ))}
                  {availableFaculty.length === 0 && (
                    <SelectItem value="none" disabled>
                      All faculty members have accounts
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {availableFaculty.length === 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  All faculty members already have accounts, or no faculty members exist yet.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-displayname">Display Name <span className="text-destructive">*</span></Label>
              <Input
                id="create-displayname"
                value={createForm.displayName}
                onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                placeholder="e.g. Rajesh Kumar"
              />
              <p className="text-xs text-muted-foreground">Auto-filled from faculty name. You can change it.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-username">Username <span className="text-destructive">*</span></Label>
              <Input
                id="create-username"
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                placeholder="e.g. rajesh.kumar"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">This will be their login username. Use lowercase letters, numbers, and dots.</p>
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

            <div className="bg-muted/50 border rounded-lg p-3 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-purple flex-shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-0.5">Initial Access: Revoked</p>
                <p>
                  By default, the faculty member will have <strong>view-only</strong> access.
                  You can grant edit access later by toggling the switch in the accounts list.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                saving ||
                !createForm.username ||
                !createForm.password ||
                !createForm.displayName ||
                !createForm.facultyId ||
                createForm.password.length < 8
              }
              className="bg-brand-purple hover:bg-brand-purple-dark"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="sm:max-w-[450px] mx-2">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{selectedAccount?.displayName}</strong> (@{selectedAccount?.username}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reset-password">New Password <span className="text-destructive">*</span></Label>
              <Input
                id="reset-password"
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handlePasswordReset}
              disabled={saving || !newPassword || newPassword.length < 8}
              className="bg-brand-purple hover:bg-brand-purple-dark"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Updating...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Faculty Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the account for{' '}
              <strong>{selectedAccount?.displayName}</strong> (@{selectedAccount?.username})?
              <br />
              <br />
              This action cannot be undone. The faculty member will no longer be able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
