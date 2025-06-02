// src/auth/types.ts

export interface User {
    username: string;
    displayName: string;
}

export interface AuthContextShape {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    login(u: string, p: string): Promise<void>;
    logout(): Promise<void>;
    refresh(): Promise<void>;
}
