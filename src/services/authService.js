import { supabase, isSupabaseConfigured } from './supabaseClient';
import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';

const USERS_KEY = STORAGE_KEYS.USERS;
const SESSION_KEY = STORAGE_KEYS.SESSION;

function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = 'length';
  var i, j;
  var result = '';
  var words = [];
  var asciiLength = ascii[lengthProperty] * 8;
  var hash = sha256.h = sha256.h || [];
  var k = sha256.k = sha256.k || [];
  var primeCounter = k[lengthProperty];
  var isPrime = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isPrime[candidate]) {
      for (i = 0; i < 300; i += candidate) {
        isPrime[i] = 1;
      }
      hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
      k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
    }
  }
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << (24 - (i % 4) * 8);
  }
  words[words[lengthProperty]] = ((asciiLength / maxWord) | 0);
  words[words[lengthProperty]] = (asciiLength);
  for (j = 0; j < words[lengthProperty]; j += 16) {
    var w = words.slice(j, j + 16);
    var a = hash[0], b = hash[1], c = hash[2], d = hash[3], e = hash[4], f = hash[5], g = hash[6], h = hash[7];
    for (i = 0; i < 64; i++) {
      var wItem = w[i];
      if (i >= 16) {
        var s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        wItem = w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      var ch = (e & f) ^ (~e & g);
      var maj = (a & b) ^ (a & c) ^ (b & c);
      var t1 = (h + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + ch + k[i] + wItem) | 0;
      var t2 = ((rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + maj) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      var byteVal = (hash[i] >> (j * 8)) & 255;
      result += (byteVal < 16 ? '0' : '') + byteVal.toString(16);
    }
  }
  return result;
}

const hashPassword = (str) => sha256(str);
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
    key = crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now().toString(36));
    localStorage.setItem(STORAGE_KEYS.SYS_KEY, key);
  }
  let numKey = 0;
  for (let i = 0; i < key.length; i++) {
    numKey = (numKey + key.charCodeAt(i)) % 256;
  }
  return numKey || 42;
};

const obfuscate = (str) => {
  let result = '';
  const key = getObfuscationKey();
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key);
  }
  return btoa(unescape(encodeURIComponent(result)));
};

const deobfuscate = (str) => {
  // 1. Try with the dynamic key
  try {
    const decoded = decodeURIComponent(escape(atob(str)));
    let result = '';
    const key = getObfuscationKey();
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key);
    }
    JSON.parse(result); // Validate it is valid JSON
    return result;
  } catch {
    // 2. Fallback to legacy static key 42 and migrate
    try {
      const decoded = decodeURIComponent(escape(atob(str)));
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ 42);
      }
      const users = JSON.parse(result);
      // Migrate on the next tick so we don't interfere with the current read operation
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
    const deobfuscated = deobfuscate(data);
    return JSON.parse(deobfuscated);
  } catch { return []; }
}

function saveUsers(users) {
  const obfuscated = obfuscate(JSON.stringify(users));
  localStorage.setItem(USERS_KEY, obfuscated);
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
      // Background sync local data to Supabase
      if (data?.user) {
        storageService.syncLocalDataToSupabase(data.user.id);
      }
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
      password: hashPassword(userData.password),
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
      // Background sync local data to Supabase
      if (data?.user) {
        storageService.syncLocalDataToSupabase(data.user.id);
      }
      return { success: true, user: data.user };
    }

    // Local Fallback
    const users = getUsers();
    const user = users.find(u => u.email === email.trim().toLowerCase());

    if (!user) {
      return { success: false, error: 'No account found with this email.' };
    }

    const hashMatch = user.password === hashPassword(password);
    const legacyMatch = !hashMatch && isBase64Match(user.password, password);

    if (!hashMatch && !legacyMatch) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Auto-migrate legacy Base64 password to SHA-256 on first successful login
    if (legacyMatch) {
      const idx = users.findIndex(u => u.id === user.id);
      users[idx].password = hashPassword(password);
      saveUsers(users);
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

    if (users[idx].password !== hashPassword(currentPassword) && !isBase64Match(users[idx].password, currentPassword)) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    users[idx].password = hashPassword(newPassword);
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
    localStorage.removeItem(`${STORAGE_KEYS.TEAMS_PREFIX}${session.id}`);
    localStorage.removeItem(`${STORAGE_KEYS.SETTINGS_PREFIX}${session.id}`);

    // Clear session
    localStorage.removeItem(SESSION_KEY);

    return { success: true };
  },
};
