const STORAGE_KEYS = {
  token: 'fitadapt_token',
  db: 'fitadapt_mock_db',
};

const NETWORK_DELAY_MS = 450;

function wait(ms = NETWORK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function generateToken(userId) {
  return `mock-jwt-${userId}-${Date.now()}`;
}

function slugifyName(name = '') {
  return name.trim().toLowerCase().replace(/\s+/g, '.');
}

function getWeekLabelsLast4Weeks() {
  const labels = [];
  const now = new Date();

  for (let i = 3; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);

    const year = d.getFullYear();
    const oneJan = new Date(year, 0, 1);
    const dayOfYear = Math.floor((d - oneJan) / 86400000) + 1;
    const week = Math.ceil(dayOfYear / 7);

    labels.push(`${year}-W${String(week).padStart(2, '0')}`);
  }

  return labels;
}

function createInitialDb() {
  return {
    users: [
      {
        id: 1,
        name: 'Demo User',
        email: 'qwe',
        password: 'qwe',
        goal: 'MUSCLE_GAIN',
        age: 23,
        gender: 'MALE',
        fitnessLevel: 'INTERMEDIATE',
        availableEquipment: ['DUMBBELLS', 'BENCH', 'BODYWEIGHT'],
        injuryHistory: null,
        bodyWeightKg: 78,
        heightCm: 180,
        createdAt: new Date().toISOString(),
      },
    ],
    sessionsByUserId: {
      1: [
        {
          id: 101,
          date: '2026-03-04',
          volumeKg: 4200,
          setsLogged: 18,
          muscles: { Chest: 6, Triceps: 4, Shoulders: 3 },
        },
        {
          id: 102,
          date: '2026-03-10',
          volumeKg: 5100,
          setsLogged: 22,
          muscles: { Back: 7, Biceps: 5, RearDelts: 3 },
        },
        {
          id: 103,
          date: '2026-03-15',
          volumeKg: 6100,
          setsLogged: 24,
          muscles: { Legs: 10, Glutes: 5, Core: 3 },
        },
        {
          id: 104,
          date: '2026-03-22',
          volumeKg: 4700,
          setsLogged: 20,
          muscles: { Chest: 5, Shoulders: 4, Triceps: 4 },
        },
      ],
    },
  };
}

function readDb() {
  const raw = localStorage.getItem(STORAGE_KEYS.db);

  if (!raw) {
    const initial = createInitialDb();
    localStorage.setItem(STORAGE_KEYS.db, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(raw);
  } catch {
    const initial = createInitialDb();
    localStorage.setItem(STORAGE_KEYS.db, JSON.stringify(initial));
    return initial;
  }
}

function writeDb(db) {
  localStorage.setItem(STORAGE_KEYS.db, JSON.stringify(db));
}

export function getToken() {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  return token || null;
}

export function setToken(token) {
  localStorage.setItem(STORAGE_KEYS.token, token);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEYS.token);
}

function getCurrentUserIdFromToken() {
  const token = getToken();
  if (!token) return null;

  const parts = token.split('-');
  if (parts.length < 4) return null;

  const userId = Number(parts[2]);
  return Number.isFinite(userId) ? userId : null;
}

function requireAuth() {
  const userId = getCurrentUserIdFromToken();
  if (!userId) throw makeError('Unauthorised.', 401);
  return userId;
}

function sanitiseUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function buildStatsForUser(userId) {
  const db = readDb();
  const sessions = db.sessionsByUserId[userId] || [];

  const totalSessionsCompleted = sessions.length;
  const totalVolumeKg = sessions.reduce((sum, s) => sum + (s.volumeKg || 0), 0);
  const totalSetsLogged = sessions.reduce((sum, s) => sum + (s.setsLogged || 0), 0);

  const muscleGroupDistribution = sessions.reduce((acc, session) => {
    Object.entries(session.muscles || {}).forEach(([muscle, count]) => {
      acc[muscle] = (acc[muscle] || 0) + count;
    });
    return acc;
  }, {});

  const last4Labels = getWeekLabelsLast4Weeks();
  const sessionsLast4Weeks = last4Labels.map((label, index) => {
    const count = sessions[index] ? 1 : 0;
    return { weekLabel: label, count };
  });

  const currentStreakWeeks = Math.min(totalSessionsCompleted, 4);

  return {
    totalSessionsCompleted,
    totalVolumeKg,
    totalSetsLogged,
    currentStreakWeeks,
    sessionsLast4Weeks,
    muscleGroupDistribution,
  };
}

export const authApi = {
  async login({ email, password }) {
    await wait();

    const db = readDb();
    const user = db.users.find(
      (u) => u.email.toLowerCase() === String(email).trim().toLowerCase()
    );

    if (!user || user.password !== password) {
      throw makeError('Invalid email or password.', 401);
    }

    return {
      token: generateToken(user.id),
    };
  },

  async register({ email, password, name }) {
    await wait();

    const trimmedName = String(name || '').trim();
    const trimmedEmail = String(email || '').trim().toLowerCase();
    const rawPassword = String(password || '');

    if (!trimmedName || !trimmedEmail || !rawPassword) {
      throw makeError('All fields are required.');
    }

    const db = readDb();

    const existingUser = db.users.find(
      (u) => u.email.toLowerCase() === trimmedEmail
    );

    if (existingUser) {
      throw makeError('An account with this email already exists.', 409);
    }

    const nextId =
      db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1;

    const newUser = {
      id: nextId,
      name: trimmedName,
      username: slugifyName(trimmedName),
      email: trimmedEmail,
      password: rawPassword,
      goal: null,
      age: null,
      gender: null,
      fitnessLevel: null,
      availableEquipment: [],
      injuryHistory: null,
      bodyWeightKg: null,
      heightCm: null,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.sessionsByUserId[nextId] = [];
    writeDb(db);

    return {
      token: generateToken(newUser.id),
    };
  },
};

export const userApi = {
  async getMe() {
    await wait();

    const userId = requireAuth();
    const db = readDb();
    const user = db.users.find((u) => u.id === userId);

    if (!user) {
      throw makeError('User not found.', 404);
    }

    return sanitiseUser(user);
  },

  async onboarding(payload) {
    await wait();

    const userId = requireAuth();
    const db = readDb();
    const userIndex = db.users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      throw makeError('User not found.', 404);
    }

    const {
      age,
      gender,
      goal,
      fitnessLevel,
      availableEquipment,
      injuryHistory,
      bodyWeightKg,
      heightCm,
    } = payload || {};

    if (!age || !gender || !goal || !fitnessLevel || !availableEquipment?.length) {
      throw makeError('Missing required onboarding fields.');
    }

    db.users[userIndex] = {
      ...db.users[userIndex],
      age,
      gender,
      goal,
      fitnessLevel,
      availableEquipment,
      injuryHistory: injuryHistory || null,
      bodyWeightKg: bodyWeightKg ?? null,
      heightCm: heightCm ?? null,
    };

    writeDb(db);

    return sanitiseUser(db.users[userIndex]);
  },

  async getStats() {
    await wait();

    const userId = requireAuth();
    return buildStatsForUser(userId);
  },
};