import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import CompassLogo from './components/CompassLogo.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErrorMsg('Неверный email или пароль.');
    }
    // On success, the onAuthStateChange listener in App.jsx re-renders the admin panel.
  };

  return (
    <div className="wrap" style={{ maxWidth: 420 }}>
      <header>
        <div className="brand-row">
          <CompassLogo size={40} className="login-brand-mark" />
          <div>
            <div className="eyebrow">Stay // Moderator Access</div>
            <h1>Stay Watch</h1>
          </div>
        </div>
        <div className="source-line">Moderator access only</div>
      </header>

      <div className="panel">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />

        {errorMsg && <div className="error-banner" style={{ marginTop: 14 }}>{errorMsg}</div>}

        <button onClick={handleLogin} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </div>

      <div className="footer-link">
        <a href="/">← Back to report form</a>
      </div>
    </div>
  );
}
