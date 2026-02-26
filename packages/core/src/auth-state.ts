export interface AuthState {
  host: string;
  token: string;
}

let currentAuth: AuthState | null = null;

export function getAuth(): AuthState {
  if (!currentAuth) {
    throw new Error("Not authenticated. Please call the auth tool first.");
  }
  return currentAuth;
}

export function getAuthOrNull(): AuthState | null {
  return currentAuth;
}

export function setAuth(auth: AuthState): void {
  currentAuth = auth;
}

export function clearAuth(): void {
  currentAuth = null;
}
