import { auth, signIn, signOut } from '@/auth';

async function SignIn({ provider, ...props }) {
  return (
    <form
      action={async () => {
        'use server';
        await signIn(provider);
      }}
    >
      <button {...props}>Sign in with {provider.charAt(0).toUpperCase() + provider.slice(1)}</button>
    </form>
  );
}

async function SignOut(props) {
  return (
    <form
      action={async () => {
        'use server';
        await signOut();
      }}
    >
      <button {...props}>Sign Out</button>
    </form>
  );
}

export default async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <h1>Twitter Political Analyzer</h1>
      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p>
              {user.name} ({user.email})
            </p>
            {user.image && <img src={user.image} alt="User avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />}
            <SignOut />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <SignIn provider="google" />
            <SignIn provider="github" />
          </div>
        )}
      </div>
    </header>
  );
}
