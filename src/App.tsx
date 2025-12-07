import { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { Hub } from 'aws-amplify/utils';
import '@aws-amplify/ui-react/styles.css';
import { GuestGateway } from './features/guest/GuestGateway';
import { MeetMeBot } from './features/chatbot/MeetMeBot';
import { ProjectGallery } from './features/portfolio/ProjectGallery';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { Nav } from './components/Nav';
import './App.css';

/**
 * Main Application Component
 * 
 * Manages the high-level view state and routing for:
 * - Gateway: Initial "Who are you?" screen (Guests vs Users)
 * - Guest Chat: Limited view for guest users to chat with the bot
 * - Auth: Authenticated view for regular users to view the portfolio
 * - Admin: Protected view for administrators to manage projects
 */
function App() {
  /**
   * viewState controls the main content being rendered.
   * - 'gateway': Default landing page
   * - 'guest_chat': Guest user experience
   * - 'auth': Signed-in user experience (Gallery)
   * - 'admin': Administrative dashboard
   */
  const [viewState, setViewState] = useState<'gateway' | 'guest_chat' | 'auth' | 'admin'>('gateway');
  const [guestEmail, setGuestEmail] = useState('');

  /**
   * Listens for global authentication events.
   * Specifically, if Amplify detects a 'signedOut' event (from token expiry or elsewhere),
   * we force the application back to the 'gateway' state for security.
   */
  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedOut') {
        setViewState('gateway');
      }
    });
    return unsubscribe;
  }, []);

  /**
   * Called when a guest provides a valid email at the gateway.
   */
  const handleGuestAccess = (email: string) => {
    setGuestEmail(email);
    setViewState('guest_chat');
  };

  /**
   * Securely handles sign out by coordinating with Amplify and resetting local state.
   * @param amplifySignOut - The signOut function provided by Amplify's Authenticator or useAuthenticator
   */
  const handleSignOut = async (amplifySignOut: (() => void) | undefined) => {
    if (amplifySignOut) await amplifySignOut();
    setViewState('gateway');
  };

  // --- Render Views ---

  // 1. Authenticated User View (Gallery)
  if (viewState === 'auth') {
    return (
      <Authenticator>
        {({ signOut, user }) => (
          <main className="main-container">
            <Nav
              viewState="auth"
              setViewState={setViewState}
              user={user}
              signOut={() => handleSignOut(signOut)}
            />

            <div className="auth-layout">
              {/* Chatbot accessible to all signed-in users */}
              <MeetMeBot />
              <div style={{ padding: '2rem', flex: 1 }}>
                <h2 style={{ marginBottom: '2rem' }}>Welcome, {user?.signInDetails?.loginId}</h2>
                <ProjectGallery />
              </div>
            </div>
          </main>
        )}
      </Authenticator>
    );
  }

  // 2. Administrator View (Dashboard)
  if (viewState === 'admin') {
    return (
      <Authenticator>
        {({ signOut, user }) => (
          <main className="main-container">
            <Nav
              viewState="admin"
              setViewState={setViewState}
              user={user}
              signOut={() => handleSignOut(signOut)}
            />
            <div className="auth-layout">
              <MeetMeBot />
              <div style={{ flex: 1 }}>
                <AdminDashboard />
              </div>
            </div>
          </main>
        )}
      </Authenticator>
    );
  }

  // 3. Guest User View (Chat only)
  if (viewState === 'guest_chat') {
    return (
      <main className="main-container">
        <Nav
          viewState="guest_chat"
          setViewState={setViewState}
        />
        <div className="guest-chat-container">
          <MeetMeBot guestEmail={guestEmail} />

          <div className="guest-chat-footer">
            <p>Want to see the projects? <a href="#" onClick={(e) => { e.preventDefault(); setViewState('auth'); }} className="link-primary">Sign In</a></p>
          </div>
        </div>
      </main>
    );
  }

  // 4. Default Gateway View (Entry Point)
  return <GuestGateway onAccessGranted={handleGuestAccess} onLoginRequest={() => setViewState('auth')} />;
}

export default App;
