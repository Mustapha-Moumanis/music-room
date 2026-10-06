import { create } from 'zustand';

import { me, type Me, type Session, logout } from '../api/auth';
import { ApiError } from '../api/errors';
import { queryClient } from '../lib/query-client';
import { setSessionExpiredHandler } from '../lib/session-events';
import { clearTokens, getRefreshToken, setAccessToken, setRefreshToken } from '../lib/token-storage';

type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

interface SessionState {
  status: SessionStatus;
  user: Me | null;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
  bootstrap: () => Promise<void>;
  loadUser: () => Promise<void>;
  setSignedOut: () => Promise<void>;
  setUser: (user: Me) => void;
}

async function storeSessionTokens(session: Session) {
  await setAccessToken(session.accessToken);
  await setRefreshToken(session.refreshToken);
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  status: 'loading',
  user: null,
  signIn: async (session) => {
    await storeSessionTokens(session);
    const user = await me();
    set({ status: 'signedIn', user });
  },
  signOut: async () => {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try { await logout({ refreshToken }); } catch { /* Logout is best-effort; local state wins. */ }
    }
    await clearTokens();
    queryClient.clear();
    set({ status: 'signedOut', user: null });
  },
  bootstrap: async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      set({ status: 'signedOut', user: null });
      return;
    }
    try {
      const user = await me();
      set({ status: 'signedIn', user });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearTokens();
        queryClient.clear();
        set({ status: 'signedOut', user: null });
        return;
      }
      // Backend unreachable (offline, changed LAN IP): keep the stored session; the profile loads later.
      set({ status: 'signedIn', user: null });
    }
  },
  loadUser: async () => {
    try { get().setUser(await me()); } catch { /* Still offline; the next attempt retries. */ }
  },
  setSignedOut: async () => {
    await clearTokens();
    queryClient.clear();
    set({ status: 'signedOut', user: null });
  },
  setUser: (user) => {
    if (get().status === 'signedIn') set({ user });
    else set({ status: 'signedIn', user });
  },
}));

setSessionExpiredHandler(async () => {
  await clearTokens();
  queryClient.clear();
  useSessionStore.setState({ status: 'signedOut', user: null });
});
