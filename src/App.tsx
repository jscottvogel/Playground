import { useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { GuestGateway } from './features/guest/GuestGateway';
import { MeetMeBot } from './features/chatbot/MeetMeBot';
import { ProjectGallery } from './features/portfolio/ProjectGallery';

function App() {
  // States: 'gateway', 'guest_chat', 'auth'
  const [viewState, setViewState] = useState<'gateway' | 'guest_chat' | 'auth'>('gateway');
  const [guestEmail, setGuestEmail] = useState('');

  const handleGuestAccess = (email: string) => {
    setGuestEmail(email);
    setViewState('guest_chat');
  };

  const Nav = () => (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      paddingBottom: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Vogel Solutions Lab</div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn" onClick={() => setViewState('gateway')} style={{ fontSize: '0.9em', padding: '0.4em 0.8em' }}>Home</button>
        {viewState === 'auth' ? null : (
          <button className="btn btn-primary" onClick={() => setViewState('auth')} style={{ fontSize: '0.9em', padding: '0.4em 0.8em' }}>Sign In</button>
        )}
      </div>
    </nav>
  );

  if (viewState === 'auth') {
    return (
      <Authenticator>
        {({ signOut, user }) => (
          <main>
            <nav style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>JSV Playground</div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9em', opacity: 0.7 }}>{user?.signInDetails?.loginId}</span>
                <button className="btn" onClick={signOut}>Sign Out</button>
              </div>
            </nav>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
              <MeetMeBot /> {/* Authenticated users also see the bot */}
              <ProjectGallery />
            </div>
          </main>
        )}
      </Authenticator>
    );
  }

  if (viewState === 'guest_chat') {
    return (
      <main>
        <Nav />
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <MeetMeBot guestEmail={guestEmail} />

          <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--color-text-dim)' }}>
            <p>Want to see the projects? <a href="#" onClick={(e) => { e.preventDefault(); setViewState('auth'); }} style={{ color: 'var(--color-primary)' }}>Sign In</a></p>
          </div>
        </div>
      </main>
    );
  }

  return <GuestGateway onAccessGranted={handleGuestAccess} onLoginRequest={() => setViewState('auth')} />;
}

export default App;
