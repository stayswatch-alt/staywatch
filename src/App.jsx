import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import LandingPage from './LandingPage';
import PublicForm from './PublicForm';
import PrivacyPage from './PrivacyPage';
import Login from './Login';
import AdminPanel from './AdminPanel';

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = still loading
  const path = window.location.pathname;
  const isAdminPath = path.startsWith('/admin');
  const isReportPath = path.startsWith('/report');
  const isPrivacyPath = path.startsWith('/privacy');

  useEffect(() => {
    if (isAdminPath) document.body.classList.add('is-admin');
    return () => document.body.classList.remove('is-admin');
  }, [isAdminPath]);

  useEffect(() => {
    if (!isAdminPath) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, [isAdminPath]);

  if (isReportPath) return <PublicForm />;
  if (isPrivacyPath) return <PrivacyPage />;
  if (!isAdminPath) return <LandingPage />;

  // Admin area
  if (session === undefined) {
    return (
      <div className="wrap">
        <div className="empty">Загрузка…</div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return <AdminPanel onLogout={() => supabase.auth.signOut()} />;
}
