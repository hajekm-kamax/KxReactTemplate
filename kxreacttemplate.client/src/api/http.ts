import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

/* ---------- tiny global token store ---------- */
let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => (accessToken = t);
const getAccessToken = () => accessToken;

/* ---------- Axios instance ---------- */
const api = axios.create({
    withCredentials: true,      // send refresh-token cookie
});

/* --- 1. attach bearer on every request --- */
api.interceptors.request.use(cfg => {
    const token = getAccessToken();
    if (token) cfg.headers!.Authorization = `Bearer ${token}`;
    return cfg;
});

/* --- 2. silent refresh on 401 / expiry --- */
let refreshCall: Promise<string> | null = null;

async function fetchNewToken() {
    const { data } = await axios.post<{ accessToken: string }>(
        '/auth/refresh',
        null,
        { withCredentials: true }
    );
    return data.accessToken;
}

api.interceptors.response.use(
    r => r,
    async (err: AxiosError) => {
        const original = err.config!;
        if (!original || original.url?.startsWith('/auth') || (original as any)._retry)
            return Promise.reject(err);

        const expired =
            !accessToken ||
            Date.now() > jwtDecode<{ exp: number }>(accessToken).exp * 1000;

        if (err.response?.status === 401 || expired) {
            if (!refreshCall) refreshCall = fetchNewToken().finally(() => (refreshCall = null));
            try {
                const newToken = await refreshCall;
                setAccessToken(newToken);
                (original as any)._retry = true;
                return api(original);            // replay
            } catch {
                return Promise.reject(err);
            }
        }
        return Promise.reject(err);
    }
);

export default api;
