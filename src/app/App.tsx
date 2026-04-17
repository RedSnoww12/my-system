import { useAuthListener } from '@/features/auth/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useTheme } from '@/hooks/useTheme';
import { useStepUrlParam } from '@/hooks/useStepUrlParam';
import { usePortraitLock } from '@/hooks/usePortraitLock';
import ToastRoot from '@/components/ui/Toast';
import AppRoutes from './routes';

export default function App() {
  useAuthListener();
  useCloudSync();
  useTheme();
  useStepUrlParam();
  usePortraitLock();

  return (
    <>
      <AppRoutes />
      <div className="rotate-gate" role="alertdialog" aria-live="polite">
        <span className="material-symbols-outlined rotate-gate-ico">
          screen_rotation
        </span>
        <h2 className="rotate-gate-t">Kripy en mode portrait</h2>
        <p className="rotate-gate-s">Remets ton téléphone à la verticale.</p>
      </div>
      <ToastRoot />
    </>
  );
}
