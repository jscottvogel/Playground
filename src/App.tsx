import { useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { GuestGateway } from './features/guest/GuestGateway';
import { MeetMeBot } from './features/chatbot/MeetMeBot';
import { ProjectGallery } from './features/portfolio/ProjectGallery';
import { Nav } from './components/Nav';
import './App.css';

function App() {
  // States: 'gateway', 'guest_chat', 'auth'
  const [viewState, setViewState] = useState<'gateway' | 'guest_chat' | 'auth'>('gateway');
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
