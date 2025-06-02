// src/auth/AuthContext.tsx

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
    PropsWithChildren,
} from 'react';
import api, { setAccessToken } from '../api/http';
import type { AuthContextShape, User } from './types';

const Ctx = createContext<AuthContextShape | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    /* ---- helpers shared with Axios ---- */
    const storeToken = (t: string | null) => {
        setToken(t);
        setAccessToken(t);
    };

    /* ---- actions ---- */
    const login = useCallback(async (username: string, password: string) => {
        const { data } = await api.post<{ accessToken: string }>('/auth/login', {
            username,
            password,
        });
        storeToken(data.accessToken);
        const me = await api.get<User>('/me');
        setUser(me.data);
    }, []);

    const refresh = useCallback(async () => {
        const { data } = await api.post<{ accessToken: string }>('/auth/refresh');
        storeToken(data.accessToken);
        const me = await api.get<User>('/me');
        setUser(me.data);
    }, []);

    const logout = useCallback(async () => {
        await api.post('/auth/logout');
        storeToken(null);
        setUser(null);
    }, []);

    /* ---- initial attempt to resume session (guarded) ---- */
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;     // skip second mount in React 18 dev Strict Mode
        ran.current = true;
        refresh().catch(() => {
            /* not logged in yet */
        });
    }, [refresh]);

    const value: AuthContextShape = {
        user,
        accessToken: token,
        isAuthenticated: !!token,
        login,
        logout,
        refresh,
    };

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
    const v = useContext(Ctx);
    if (!v) throw new Error('useAuth outside <AuthProvider>');
    return v;
};
