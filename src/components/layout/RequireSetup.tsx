import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

interface Props {
  children: ReactNode;
}

export default function RequireSetup({ children }: Props) {
  const setup = useSettingsStore((s) => s.setup);
  if (!setup) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}
