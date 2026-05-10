'use client';

import { useMemo } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  section: string;
  mode: 'read' | 'write';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ section, mode, children, fallback }: PermissionGuardProps) {
  const { canRead, canWrite, loading } = usePermissions();

  const hasPermission = useMemo(() => {
    if (loading) return false;
    return mode === 'read' ? canRead(section) : canWrite(section);
  }, [loading, canRead, canWrite, section, mode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 text-brand-purple animate-spin" />
      </div>
    );
  }

  if (!hasPermission) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            You don&apos;t have {mode} permission for the {section} section. Contact your administrator for access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
