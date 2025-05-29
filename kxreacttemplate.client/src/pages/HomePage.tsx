import { useEffect, useState, useRef } from 'react';
import api from '../api/http';
import { useAuth } from '../auth/useAuth';

interface Forecast {
    date: string;
    temperatureC: number;
    summary: string;
}

export default function HomePage() {
    const { user, logout } = useAuth();
    const [data, setData] = useState<Forecast[] | null>(null);
    const [err, setErr] = useState('');

    /* ---------- guard to skip the 2nd dev-only mount ---------- */
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;         // dev Strict Mode mount #2  exit
        ran.current = true;              // mark as done

        api
            .get<Forecast[]>('/weatherforecast')
            .then(r => setData(r.data))
            .catch(() => setErr('Failed to load weather'));
    }, []);

    return (
        <div>
            <h1>Hello {user?.displayName ?? user?.username}</h1>
            <button onClick={logout}>Logout</button>

            <h2>Weather (built-in sample controller)</h2>
            {err && <p>{err}</p>}
            {data ? (
                <ul>
                    {data.slice(0, 3).map(f => (
                        <li key={f.date}>
                            {f.date}: {f.temperatureC} °C – {f.summary}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Loading…</p>
            )}
        </div>
    );
}
