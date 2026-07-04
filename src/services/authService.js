import { supabase, isSupabaseConfigured } from './supabaseClient';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';

const USERS_KEY = STORAGE_KEYS.USERS;
const SESSION_KEY = STORAGE_KEYS.SESSION;

/**
 * Hashes a plain-text string with SHA-256 via the native Web Crypto API.
 * Returns a lowercase hex digest string.
 */
const hashPassword = async (str) => {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Legacy Base64 password comparison — kept only to auto-migrate accounts
 * created before v1.2 (pre-SHA-256 storage). Safe to remove after 2027-01
 * once localStorage data has been fully migrated on first login.
 */
const isBase64Match = (storedHash, plainPassword) => {
  try {
    return btoa(unescape(encodeURIComponent(plainPassword))) === storedHash;
  } catch {
    return false;
  }
};

const getObfuscationKey = () => {
  let key = localStorage.getItem(STORAGE_KEYS.SYS_KEY);
  if (!key) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      key = crypto.randomUUID();
    } else {
      const array = new Uint32Array(4);
      (typeof crypto !== 'undefined' ? crypto : self.crypto).getRandomValues(array);
      key = Array.from(array, num => num.toString(36)).join('-');
    }
    localStorage.setItem(STORAGE_KEYS.SYS_KEY, key);
  }
  let numKey = 0;
  for (let i = 0; i < key.length; i++) {
    numKey = (numKey + key.charCodeAt(i)) % 256;
  }
  return numKey || 42;
};

const obfuscate = (str) => {
  const key = getObfuscationKey();
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key);
  }
  return btoa(unescape(encodeURIComponent(result)));
};

const deobfuscate = (str) => {
  // 1. Try with the dynamic key
  try {
    const decoded = decodeURIComponent(escape(atob(str)));
    const key = getObfuscationKey();
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key);
    }
    JSON.parse(result); // Validate it is well-formed JSON
    return result;
  } catch {
    // 2. Fallback to legacy static key 42 and migrate on next tick
    try {
      const decoded = decodeURIComponent(escape(atob(str)));
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ 42);
      }
      const users = JSON.parse(result);
      setTimeout(() => saveUsers(users), 50);
      return result;
    } catch {
      return str;
    }
  }
};

function getUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) return [];
    return JSON.parse(deobfuscate(data));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, obfuscate(JSON.stringify(users)));
}

export const authService = {
  async register(userData) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email.trim(),
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName.trim(),
            role: userData.role || 'Head Coach',
          },
        },
      });
      if (error) return { success: false, error: error.message };
      if (data?.user) {
        storageService.syncLocalDataToSupabase(data.user.id);
      }
      return { success: true, user: data.user };
    }

    // Local fallback
    const users = getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      fullName: userData.fullName.trim(),
      email: userData.email.trim().toLowerCase(),
      password: await hashPassword(userData.password),
      organization: userData.organization?.trim() || '',
      role: userData.role || 'Head Coach',
      experience: userData.experience || '1-3 years',
      avatar: userData.fullName
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const sessionUser = { ...newUser };
    delete sessionUser.password;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
  },

  async login(email, password) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { success: false, error: error.message };
      if (data?.user) {
        storageService.syncLocalDataToSupabase(data.user.id);
      }
      return { success: true, user: data.user };
    }

    // Local fallback
    const users = getUsers();
    const user = users.find((u) => u.email === email.trim().toLowerCase());

    if (!user) {
      return { success: false, error: 'No account found with this email.' };
    }

    const hash = await hashPassword(password);
    const hashMatch = user.password === hash;
    const legacyMatch = !hashMatch && isBase64Match(user.password, password);

    if (!hashMatch && !legacyMatch) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Auto-migrate legacy Base64 password to SHA-256 on first successful login
    if (legacyMatch) {
      const idx = users.findIndex((u) => u.id === user.id);
      users[idx].password = hash;
      saveUsers(users);
    }

    const sessionUser = { ...user };
    delete sessionUser.password;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
  },

  /**
   * Log out the current user.
   */
  async logout() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem(SESSION_KEY);
  },

  /**
   * Get the currently logged-in user from session.
   * @returns {object|null}
   */
  getCurrentUser() {
    try {
      const data = sessionStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Update the current user's profile.
   * @param {object} updates - Fields to merge into the user record.
   * @returns {{ success: boolean, user?: object, error?: string }}
   */
  updateUser(updates) {
    const session = this.getCurrentUser();
    if (!session) return { success: false, error: 'Not logged in.' };

    const users = getUsers();
    const idx = users.findIndex((u) => u.id === session.id);
    if (idx === -1) return { success: false, error: 'User not found.' };

    if (updates.email && updates.email.toLowerCase() !== users[idx].email) {
      const conflict = users.find(
        (u) => u.email === updates.email.toLowerCase() && u.id !== session.id
      );
      if (conflict) return { success: false, error: 'This email is already taken.' };
    }

    const updatedUser = { ...users[idx], ...updates };
    if (updates.fullName) {
      updatedUser.avatar = updates.fullName
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (updates.email) {
      updatedUser.email = updates.email.trim().toLowerCase();
    }

    users[idx] = updatedUser;
    saveUsers(users);

    const sessionUser = { ...updatedUser };
    delete sessionUser.password;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
  },

  /**
   * Change the user's password.
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async changePassword(currentPassword, newPassword) {
    const session = this.getCurrentUser();
    if (!session) return { success: false, error: 'Not logged in.' };

    const users = getUsers();
    const idx = users.findIndex((u) => u.id === session.id);
    if (idx === -1) return { success: false, error: 'User not found.' };

    const currentHash = await hashPassword(currentPassword);
    const isValid =
      users[idx].password === currentHash || isBase64Match(users[idx].password, currentPassword);

    if (!isValid) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    users[idx].password = await hashPassword(newPassword);
    saveUsers(users);

    return { success: true };
  },

  /**
   * Delete the current user's account and all associated data.
   * @returns {{ success: boolean }}
   */
  deleteAccount() {
    const session = this.getCurrentUser();
    if (!session) return { success: false };

    const users = getUsers();
    saveUsers(users.filter((u) => u.id !== session.id));

    localStorage.removeItem(`${STORAGE_KEYS.TEAMS_PREFIX}${session.id}`);
    localStorage.removeItem(`${STORAGE_KEYS.SETTINGS_PREFIX}${session.id}`);
    sessionStorage.removeItem(SESSION_KEY);

    return { success: true };
  },
};
