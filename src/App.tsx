import { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser } from 'aws-amplify/auth';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import '@aws-amplify/ui-react/styles.css';
import { GuestGateway } from './features/guest/GuestGateway';
import { ChatInterface } from './features/chatbot/ChatInterface';
import { ProjectGallery } from './features/portfolio/ProjectGallery';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { PrivacyPolicy } from './features/legal/PrivacyPolicy';
import { TermsOfService } from './features/legal/TermsOfService';
import './App.css';
import { AuthLogger } from './services/Logger';
import { ScottBot } from './features/chatbot/ScottBot';
import { ContactOptions } from './features/contact/ContactOptions';

interface AdminRouteWrapperProps {
  authUser: any;
  user: any;
  setUser: (user: any) => void;
  signOut: (() => void) | undefined;
  handleSignOut: () => void;
}

function AdminRouteWrapper({ authUser, user, setUser, signOut, handleSignOut }: AdminRouteWrapperProps) {
  useEffect(() => {
    if (authUser && (!user || user?.signInDetails?.loginId !== authUser?.signInDetails?.loginId)) {
      setUser(authUser);
    }
  }, [authUser, user, setUser]);

  return (
    <main className="main-container">
      <Nav user={authUser} signOut={() => { signOut?.(); handleSignOut(); }} />
      <div className="auth-layout animate-fade-in">
        <AdminDashboard />
        <ProjectGallery />
        <ScottBot mode="widget" />
      </div>
      <Footer />
    </main>
  );
}

function MainAppContent() {
  const [hasGuestAccess, setHasGuestAccess] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Listen for Amplify auth state changes and initial load user state
  useEffect(() => {
    // Initial fetch of current user
    getCurrentUser()
      .then(u => {
        AuthLogger.info('Successfully fetched current user on mount', u);
        setUser(u);
      })
      .catch((err) => {
        AuthLogger.debug('No active user session on mount:', err);
        setUser(null);
      });

    AuthLogger.info('Auth Hub listener initialized');
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      AuthLogger.debug(`Auth Hub Event: ${payload.event}`, payload);
      if (payload.event === 'signedIn') {
        getCurrentUser()
          .then(u => {
            setUser(u);
          })
          .catch(() => setUser(null));
      } else if (payload.event === 'signedOut') {
        AuthLogger.info('Detected sign-out, cleaning user state');
        setUser(null);
        setGuestAccessStatus(false);
        navigate('/');
      }
    });
    return unsubscribe;
  }, [navigate]);

  const setGuestAccessStatus = (status: boolean) => {
    setHasGuestAccess(status);
  };

  const handleGuestAccess = (email: string) => {
    AuthLogger.info(`Handling guest access for: ${email}`);
    setGuestEmail(email);
    setHasGuestAccess(true);
  };

  const handleSignOut = () => {
    setGuestAccessStatus(false);
    setUser(null);
    navigate('/');
  };

  return (
    <Routes>
      {/* 1. Public Homepage (Gateway or Full Workspace) */}
      <Route
        path="/"
        element={
          !hasGuestAccess && !user ? (
            <GuestGateway
              onAccessGranted={handleGuestAccess}
              onLoginRequest={() => navigate('/admin')}
            />
          ) : (
            <main className="main-container">
              <Nav user={user} signOut={handleSignOut} />
              <div className="auth-layout animate-fade-in">
                <ChatInterface userEmail={guestEmail || user?.signInDetails?.loginId} className="embedded-section" />
                <ProjectGallery />
                <ContactOptions />
              </div>
              <Footer />
            </main>
          )
        }
      />

      {/* 2. Showcase / Experiments View */}
      <Route
        path="/experiments"
        element={
          <main className="main-container">
            <Nav user={user} signOut={handleSignOut} />
            <div className="auth-layout animate-fade-in">
              <ProjectGallery />
              <ContactOptions />
            </div>
            <Footer />
          </main>
        }
      />

      {/* 3. Legal pages */}
      <Route
        path="/privacy"
        element={
          <main className="main-container">
            <Nav user={user} signOut={handleSignOut} />
            <PrivacyPolicy />
            <Footer />
          </main>
        }
      />
      <Route
        path="/terms"
        element={
          <main className="main-container">
            <Nav user={user} signOut={handleSignOut} />
            <TermsOfService />
            <Footer />
          </main>
        }
      />

      {/* 4. Admin Portal (Protected) */}
      <Route
        path="/admin"
        element={
          <Authenticator>
            {({ signOut, user: authUser }) => (
              <AdminRouteWrapper
                authUser={authUser}
                user={user}
                setUser={setUser}
                signOut={signOut}
                handleSignOut={handleSignOut}
              />
            )}
          </Authenticator>
        }
      />

      {/* Redirect fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return <MainAppContent />;
}

export default App;
