import { FormEvent, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const { isAuthenticated, login } = useAuth();
    const [error, setError] = useState('');
    const navigate = useNavigate();                 //  add

    if (isAuthenticated) return <Navigate to="/" replace />;

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        try {
            await login(String(f.get('username')), String(f.get('password')));
            navigate('/', { replace: true });           //  go to Home
        } catch {
            setError('Invalid credentials');
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            <div>
                <label>
                    User
                    <input name="username" required />
                </label>
            </div>
            <div>
                <label>
                    Password
                    <input type="password" name="password" required />
                </label>
            </div>
            <button type="submit">Sign in</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
}
