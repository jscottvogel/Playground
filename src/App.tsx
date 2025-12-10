import { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { Hub } from 'aws-amplify/utils';
import '@aws-amplify/ui-react/styles.css';
import { GuestGateway } from './features/guest/GuestGateway';
import { GuestChat } from './features/guest/GuestChat';
import { ScottBot } from './features/chatbot/ScottBot';
import { ProjectGallery } from './features/portfolio/ProjectGallery';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { Nav } from './components/Nav';
import './App.css';
import { AuthLogger } from './services/Logger';

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
   * - 'guest_chat': Guest user experience (Bot is Embedded/Centered)
   * - 'auth': Signed-in user experience (Gallery + Bot Widget)
   * - 'admin': Administrative dashboard (Dashboard + Bot Widget)
   */
  const [viewState, setViewState] = useState<'gateway' | 'guest_chat' | 'auth' | 'admin'>('gateway');
  const [guestEmail, setGuestEmail] = useState('');

  /**
   * Listens for global authentication events.
   * Specifically, if Amplify detects a 'signedOut' event (from token expiry or elsewhere),
   * we force the application back to the 'gateway' state for security.
   */
  useEffect(() => {
    AuthLogger.info('Auth Hub listener initialized');
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      AuthLogger.debug(`Auth Hub Event: ${payload.event}`, payload);
      if (payload.event === 'signedOut') {
        AuthLogger.info('Detected external sign-out, resetting view to gateway');
        setViewState('gateway');
      }
    });
    return unsubscribe;
  }, []);

  // Log view state changes
  useEffect(() => {
    AuthLogger.debug(`Current ViewState: ${viewState}`);
    if (viewState === 'guest_chat') {
      AuthLogger.debug(`Guest Email: ${guestEmail}`);
    }
  }, [viewState, guestEmail]);

  /**
   * Called when a guest provides a valid email at the gateway.
   */
  const handleGuestAccess = (email: string) => {
    AuthLogger.info(`Handling guest access for: ${email}`);
    setGuestEmail(email);
    setViewState('guest_chat');
  };

  /**
   * Securely handles sign out by coordinating with Amplify and resetting local state.
   * @param amplifySignOut - The signOut function provided by Amplify's Authenticator or useAuthenticator
   */
  const handleSignOut = async (amplifySignOut: (() => void) | undefined) => {
    AuthLogger.info('User initiated Sign Out');
    if (amplifySignOut) {
      await amplifySignOut();
      AuthLogger.info('Amplify SignOut completed');
    }
    setViewState('gateway');
  };

  // --- Render Views ---

  // 1. Authenticated User View (Gallery)
  if (viewState === 'auth') {
    return (
      <Authenticator>
        {({ signOut, user }) => {
          // Log user presence mainly on mount or change, but inside render it's noisy. 
          // We'll trust the Hub event logs for auth flow mostly.
          return (
            <main className="main-container">
              <Nav
                viewState="auth"
                setViewState={setViewState}
                user={user}
                signOut={() => handleSignOut(signOut)}
              />

              <div className="auth-layout">
                <h2 style={{ marginTop: 0, marginBottom: '2rem' }}>Welcome, {user?.signInDetails?.loginId}</h2>
                <ProjectGallery />
              </div>
              <ScottBot mode="widget" />
            </main>
          )
        }}
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
              {/* Admin Features take full width now */}
              <AdminDashboard />
            </div>
            {/* Floating Widget */}
            <ScottBot mode="widget" />
          </main>
        )}
      </Authenticator>
    );
  }

  import { GuestChat } from './features/guest/GuestChat';

  // ... imports ...

  // ... inside App component ...

  // 3. Guest User View (Chat only)
  if (viewState === 'guest_chat') {
    return (
      <main className="main-container">
        <Nav
          viewState="guest_chat"
          setViewState={setViewState}
        />
        <GuestChat
          guestEmail={guestEmail}
          onSignInRequest={() => setViewState('auth')}
        />
      </main>
    );
  }

  // 4. Default Gateway View (Entry Point)
  return <GuestGateway onAccessGranted={handleGuestAccess} onLoginRequest={() => setViewState('auth')} />;
}

export default App;
