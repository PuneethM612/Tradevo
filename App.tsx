
import React, { useState, useEffect } from 'react';
// Use HashRouter instead of BrowserRouter to ensure routing works correctly in all environments
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, isConfigured } from './lib/supabase';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TerminalDashboard from './pages/TerminalDashboard';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00ff9c] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isLoggedIn = !!session;

  return (
    <Router>
      <div className="min-h-screen bg-black text-white selection:bg-[#00ff9c] selection:text-black relative">
        <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/login" 
            element={isLoggedIn ? <Navigate to="/terminal" /> : <LoginPage onMockLogin={() => {}} />} 
          />
          <Route 
            path="/signup" 
            element={isLoggedIn ? <Navigate to="/terminal" /> : <SignupPage onMockLogin={() => {}} />} 
          />
          <Route 
            path="/terminal" 
            element={isLoggedIn ? <TerminalDashboard onLogout={logout} /> : <Navigate to="/login" />} 
          />
          {/* Catch-all route for any undefined paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
