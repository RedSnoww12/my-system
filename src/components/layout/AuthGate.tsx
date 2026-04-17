import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useSessionStore } from '@/store/useSessionStore';

interface Props {
  children: ReactNode;
}

export default function AuthGate({ children }: Props) {
  const authReady = useSessionStore((s) => s.authReady);
  const user = useSessionStore((s) => s.user);
  const hasSkipped = useSessionStore((s) => s.hasSkippedAuth);

  if (!authReady) {
    return <div className="auth-loading" aria-busy="true" />;
  }

  if (!user && !hasSkipped) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
