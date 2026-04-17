import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import RouteFallback from '@/components/layout/RouteFallback';
import AuthPage from '@/pages/AuthPage';
import OnboardingPage from '@/pages/OnboardingPage';
import HomePage from '@/pages/HomePage';

const MealsPage = lazy(() => import('@/pages/MealsPage'));
const SportPage = lazy(() => import('@/pages/SportPage'));
const StatsPage = lazy(() => import('@/pages/StatsPage'));
const RecipesPage = lazy(() => import('@/pages/RecipesPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="meals" element={<MealsPage />} />
          <Route path="sport" element={<SportPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
