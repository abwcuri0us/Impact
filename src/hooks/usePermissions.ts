'use client';

import { useEffect, useState, useCallback } from 'react';

interface Permissions {
  [section: string]: { read: boolean; write: boolean };
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permissions>({});
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setPermissions(data.user.permissions || {});
          setRole(data.user.role || '');
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const canRead = useCallback(
    (section: string) => {
      const perm = permissions[section];
      return perm ? perm.read : false;
    },
    [permissions]
  );

  const canWrite = useCallback(
    (section: string) => {
      const perm = permissions[section];
      return perm ? perm.write : false;
    },
    [permissions]
  );

  return { permissions, role, loading, canRead, canWrite };
}
