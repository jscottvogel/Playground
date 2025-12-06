import { useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { GuestGateway } from './features/guest/GuestGateway';
import { MeetMeBot } from './features/chatbot/MeetMeBot';
import { ProjectGallery } from './features/portfolio/ProjectGallery';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { Nav } from './components/Nav';
import './App.css';

function App() {
  // States: 'gateway', 'guest_chat', 'auth', 'admin'
  const [viewState, setViewState] = useState<'gateway' | 'guest_chat' | 'auth' | 'admin'>('gateway');
  const [guestEmail, setGuestEmail] = useState('');

  const handleGuestAccess = (email: string) => {
    setGuestEmail(email);
    setViewState('guest_chat');
  };

  if (viewState === 'auth') {
    return (
      <Authenticator>
        {({ signOut, user }) => (
          <main className="main-container">
            <Nav
              viewState="auth"
              setViewState={setViewState}
              user={user}
              signOut={signOut}
            />

            <div className="auth-layout">
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

  if (viewState === 'admin') {
    return (
      <Authenticator>
        {({ signOut, user }) => (
          <main className="main-container">
            <Nav viewState="admin" setViewState={setViewState} user={user} signOut={signOut} />
            <div style={{ display: 'flex', gap: '2rem' }}>
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

  return <GuestGateway onAccessGranted={handleGuestAccess} onLoginRequest={() => setViewState('auth')} />;
}

export default App;
