export type User = {
    id: number;
    username: string;
    email: string;
}

export type AuthSession = {
    token: string;
    user: User;
}

export type AuthResponse = AuthSession;