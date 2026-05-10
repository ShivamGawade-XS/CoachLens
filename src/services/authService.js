import { supabase, isSupabaseConfigured } from './supabaseClient';

const USERS_KEY = 'coachlens_users';
const SESSION_KEY = 'coachlens_session';

const encode = (str) => btoa(unescape(encodeURIComponent(str)));
const decode = (str) => {
  try { return decodeURIComponent(escape(atob(str))); }
  catch { return ''; }
};

function getUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
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
          }
        }
      });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user };
    }

    // Local Fallback
    const users = getUsers();
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      fullName: userData.fullName.trim(),
      email: userData.email.trim().toLowerCase(),
      password: encode(userData.password),
      organization: userData.organization?.trim() || '',
      role: userData.role || 'Head Coach',
      experience: userData.experience || '1-3 years',
      avatar: userData.fullName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const sessionUser = { ...newUser };
    delete sessionUser.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
  },

  async login(email, password) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user };
    }

    // Local Fallback
    const users = getUsers();
    const user = users.find(u => u.email === email.trim().toLowerCase());

    if (!user) {
      return { success: false, error: 'No account found with this email.' };
    }

    if (decode(user.password) !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const sessionUser = { ...user };
    delete sessionUser.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
  },

  /**
   * Log out the current user
   */
  async logout() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(SESSION_KEY);
  },

  /**
   * Get the currently logged-in user from session
   * @returns {object|null}
   */
  getCurrentUser() {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },

  /**
   * Update the current user's profile
   * @param {object} updates - fields to merge into the user record
   * @returns {{ success: boolean, user?: object, error?: string }}
   */
  updateUser(updates) {
    const session = this.getCurrentUser();
    if (!session) return { success: false, error: 'Not logged in.' };

    const users = getUsers();
    const idx = users.findIndex(u => u.id === session.id);
    if (idx === -1) return { success: false, error: 'User not found.' };

    // If email is changing, check for conflicts
    if (updates.email && updates.email.toLowerCase() !== users[idx].email) {
      const conflict = users.find(u => u.email === updates.email.toLowerCase() && u.id !== session.id);
      if (conflict) return { success: false, error: 'This email is already taken.' };
    }

    // Merge updates
    const updatedUser = { ...users[idx], ...updates };
    if (updates.fullName) {
      updatedUser.avatar = updates.fullName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (updates.email) {
      updatedUser.email = updates.email.trim().toLowerCase();
    }

    users[idx] = updatedUser;
    saveUsers(users);

    // Update session
    const sessionUser = { ...updatedUser };
    delete sessionUser.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
  },

  /**
   * Change the user's password
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {{ success: boolean, error?: string }}
   */
  changePassword(currentPassword, newPassword) {
    const session = this.getCurrentUser();
    if (!session) return { success: false, error: 'Not logged in.' };

    const users = getUsers();
    const idx = users.findIndex(u => u.id === session.id);
    if (idx === -1) return { success: false, error: 'User not found.' };

    if (decode(users[idx].password) !== currentPassword) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    users[idx].password = encode(newPassword);
    saveUsers(users);

    return { success: true };
  },

  /**
   * Delete the current user's account and all associated data
   * @returns {{ success: boolean }}
   */
  deleteAccount() {
    const session = this.getCurrentUser();
    if (!session) return { success: false };

    // Remove user from users list
    const users = getUsers();
    const filtered = users.filter(u => u.id !== session.id);
    saveUsers(filtered);

    // Clear user-specific data
    localStorage.removeItem(`coachlens_teams_${session.id}`);
    localStorage.removeItem(`coachlens_settings_${session.id}`);

    // Clear session
    localStorage.removeItem(SESSION_KEY);

    return { success: true };
  },
};
