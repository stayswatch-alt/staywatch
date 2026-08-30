import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import LandingPage from './LandingPage';
import PublicForm from './PublicForm';
import Login from './Login';
import AdminPanel from './AdminPanel';

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = still loading
  const path = window.location.pathname;
  const isAdminPath = path.startsWith('/admin');
  const isReportPath = path.startsWith('/report');

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

  // Public landing page
  if (!isAdminPath && !isReportPath) {
    return <LandingPage />;
  }

  // Public report form
  if (isReportPath) {
    return <PublicForm />;
  }

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
