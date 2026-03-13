const memoryUsers = new Map();

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function getMemoryUserById(id) {
  for (const user of memoryUsers.values()) {
    if (user.id === id) {
      return user;
    }
  }

  return null;
}

export function hasMemoryUser(email) {
  return memoryUsers.has(normalizeEmail(email));
}

export function getMemoryUserByEmail(email) {
  return memoryUsers.get(normalizeEmail(email));
}

export function saveMemoryUser(user) {
  memoryUsers.set(normalizeEmail(user.email), user);
  return user;
}
