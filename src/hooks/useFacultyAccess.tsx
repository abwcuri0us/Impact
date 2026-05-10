'use client';

import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';

interface FacultyAccess {
  accessGranted: boolean;
  isFaculty: boolean;
  loading: boolean;
}

const FacultyAccessContext = createContext<FacultyAccess>({
  accessGranted: false,
  isFaculty: false,
  loading: true,
});

export function FacultyAccessProvider({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<FacultyAccess>({
    accessGranted: false,
    isFaculty: false,
    loading: true,
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setAccess({
              accessGranted: data.user.accessGranted || false,
              isFaculty: data.user.isFaculty || false,
              loading: false,
            });
          } else {
            setAccess({ accessGranted: false, isFaculty: false, loading: false });
          }
        } else {
          setAccess({ accessGranted: false, isFaculty: false, loading: false });
        }
      } catch {
        setAccess({ accessGranted: false, isFaculty: false, loading: false });
      }
    };
    checkAccess();
  }, []);

  return (
    <FacultyAccessContext.Provider value={access}>
      {children}
    </FacultyAccessContext.Provider>
  );
}

export function useFacultyAccess() {
  return useContext(FacultyAccessContext);
}
