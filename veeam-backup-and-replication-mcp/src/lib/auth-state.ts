export interface VbrAuth {
  host: string;
  token: string;
}

let currentAuth: VbrAuth | null = null;

export function getAuth(): VbrAuth {
  if (!currentAuth) {
    throw new Error("Not authenticated. Please call auth-vbr tool first.");
  }
  return currentAuth;
}

export function getAuthOrNull(): VbrAuth | null {
  return currentAuth;
}

export function setAuth(auth: VbrAuth): void {
  currentAuth = auth;
}

export function clearAuth(): void {
  currentAuth = null;
}
