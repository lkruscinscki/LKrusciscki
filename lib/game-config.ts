// Every tunable number in the game lives here. Change values freely —
// nothing else in the app should hardcode an XP amount, level cost, or
// streak threshold.

export const XP = {
  academico: {
    // Used starting Fase 5, once materias/guias exist.
    studySessionMinMinutes: 25,
    studySessionBase: 10,
    studySessionPerExtra10Min: 1,
    studySessionCap: 40,
    exerciseResolved: 5,
    guideCompleted: 50,
    subjectOnTrack: 40, // al cierre de semana
  },
  deportivo: {
    jiujitsuSession: 30,
    submissionAchieved: 2,
    submissionReceived: 1, // a proposito: sin incentivo para mentir
    sessionNotesBonus: 5,
    crossTrainingSession: 20,
    competitionBonus: 100, // una vez, al cargar el primer combate
    competitionMatch: 25, // por combate, gane o pierda
  },
  profesional: {
    projectLogEntry: 15, // maximo una vez por proyecto por dia
  },
  personal: {
    meditation: 10,
    journaling: 10,
    readingMinPages: 10,
    readingBase: 10,
    readingPerExtra5Pages: 1,
    readingCap: 20,
    creativeBlockMinMinutes: 30,
    creativeBlock: 25,
    chess: 10,
    stretching: 10,
    supplements: 10,
    // Sleep: base for logging anything, plus a bonus for every hour past
    // the daily goal (fetched from user_settings), capped like reading.
    sleepBase: 10,
    sleepBonusPerExtraHour: 2,
    sleepCap: 20,
  },
} as const;

export const WEEKLY_GOALS = {
  crossTrainingSessions: 2,
  studyExercisesPerSubject: 10,
} as const;

// XP needed to go from `level` to `level + 1`.
export const XP_PER_LEVEL = 100;

export function xpRequiredForLevel(level: number): number {
  return XP_PER_LEVEL * level;
}

export function getLevelFromXp(totalXp: number): {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
} {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level);
    level += 1;
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: xpRequiredForLevel(level) };
}

// Checked in order; first tier the streak qualifies for wins.
export const STREAK_MULTIPLIER_TIERS = [
  { minDays: 30, multiplier: 1.5 },
  { minDays: 14, multiplier: 1.3 },
  { minDays: 7, multiplier: 1.2 },
  { minDays: 3, multiplier: 1.1 },
] as const;

export function getStreakMultiplier(streakDays: number): number {
  for (const tier of STREAK_MULTIPLIER_TIERS) {
    if (streakDays >= tier.minDays) return tier.multiplier;
  }
  return 1;
}

// A day counts toward the global streak once this many XP-granting
// actions (across any pillar) were logged that day.
export const GLOBAL_STREAK_MIN_ACTIONS = 3;
