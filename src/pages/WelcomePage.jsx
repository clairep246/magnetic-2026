import { Link } from 'react-router-dom'

export default function WelcomePage() {
  return (
    <section>
      <h1>Find Your People</h1>
      <p>
        Can't find a buddy to join a workshop with? Want someone with the same
        interests as you?
      </p>
      <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center' }}>
        <Link to="/signup" style={{ textDecoration: 'none', padding: '12px 24px', border: '1px solid #6b63ff', borderRadius: 8 }}>
          Get started
        </Link>
        <Link to="/login" style={{ textDecoration: 'none', padding: '12px 24px', border: '1px solid #aaa', borderRadius: 8 }}>
          Sign in
        </Link>
      </div>
    </section>
  )
}
